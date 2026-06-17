'use strict';

/**
 * start.js — Production launcher for Cybork (ReeF Bot)
 *
 * Works in any environment: Pterodactyl Panel, PM2, bare Node.js, Docker, VPS.
 * Features:
 *   • Required environment variable validation before starting
 *   • Child-process isolation — index.js runs as a child; launcher stays alive
 *   • Auto-restart with exponential back-off on crash
 *   • Stable-uptime detection — resets restart counter after a clean run
 *   • Configurable max restarts before giving up
 *   • Graceful SIGTERM / SIGINT forwarding (Pterodactyl Panel compatible)
 *   • Force-SIGKILL if child ignores SIGTERM after timeout
 *   • Launcher-level uncaughtException / unhandledRejection guards
 *   • Minimum Node.js version enforcement
 *   • Inherits stdio so Pterodactyl / PM2 capture all bot output correctly
 */

const { spawn }   = require('child_process');
const path        = require('path');
const os          = require('os');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  /** Entry point to launch */
  script: path.join(__dirname, 'index.js'),

  /** Required environment variables — launcher exits if any are missing */
  requiredEnvVars: ['DISCORD_TOKEN'],

  /** Optional env vars — warns if absent but does not block startup */
  optionalEnvVars: ['DATABASE_URL', 'TOPGG_API'],

  /** Minimum Node.js major version */
  minNodeMajor: 16,

  /** Maximum consecutive restarts before permanent exit */
  maxRestarts: 10,

  /**
   * If the process runs for at least this long (ms) before crashing,
   * the restart counter is reset to 0 (treat it as a fresh start).
   */
  stableUptimeMs: 60_000,

  /** Initial back-off delay (ms) — doubles each restart up to maxBackoffMs */
  backoffBaseMs: 2_000,

  /** Upper cap for back-off delay */
  maxBackoffMs: 60_000,

  /**
   * After sending SIGTERM to the child, wait this many ms before
   * escalating to SIGKILL (important for Pterodactyl's stop timeout).
   */
  gracePeriodMs: 10_000,
};

// ─── State ────────────────────────────────────────────────────────────────────

let child        = null;
let restarts     = 0;
let lastStart    = 0;
let shuttingDown = false;
let restartTimer = null;

// ─── Logger ───────────────────────────────────────────────────────────────────

const LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', BOOT: 'BOOT' };

function log(level, ...parts) {
  const ts  = new Date().toISOString();
  const msg = parts.join(' ');
  // Use stderr for WARN/ERROR so Pterodactyl can separate streams; stdout for rest
  const out = (level === LEVELS.ERROR || level === LEVELS.WARN) ? process.stderr : process.stdout;
  out.write(`[${ts}] [LAUNCHER/${level}] ${msg}\n`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMs(ms) {
  if (ms < 1_000)  return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1_000)}s`;
}

function backoffDelay() {
  return Math.min(CONFIG.backoffBaseMs * Math.pow(2, restarts), CONFIG.maxBackoffMs);
}

// ─── Pre-flight checks ────────────────────────────────────────────────────────

function checkNodeVersion() {
  const major = parseInt(process.versions.node.split('.')[0], 10);
  if (major < CONFIG.minNodeMajor) {
    log(LEVELS.ERROR,
      `Node.js v${process.versions.node} is too old.`,
      `Required: v${CONFIG.minNodeMajor}+. Please upgrade.`
    );
    process.exit(1);
  }
  log(LEVELS.BOOT, `Node.js ${process.versions.node} — OK`);
}

function validateEnv() {
  const missing = CONFIG.requiredEnvVars.filter(k => !process.env[k]);
  if (missing.length > 0) {
    log(LEVELS.ERROR, `Missing required environment variables: ${missing.join(', ')}`);
    log(LEVELS.ERROR, 'Set them in your panel\'s environment settings and restart.');
    process.exit(1);
  }

  const absent = CONFIG.optionalEnvVars.filter(k => !process.env[k]);
  if (absent.length > 0) {
    log(LEVELS.WARN, `Optional env vars not set (features may be limited): ${absent.join(', ')}`);
  }

  log(LEVELS.BOOT, 'Environment variables validated — OK');
}

function printBanner() {
  log(LEVELS.BOOT, '─────────────────────────────────────────');
  log(LEVELS.BOOT, '  Cybork Bot Launcher');
  log(LEVELS.BOOT, `  Script   : ${CONFIG.script}`);
  log(LEVELS.BOOT, `  Platform : ${os.type()} ${os.release()} (${os.arch()})`);
  log(LEVELS.BOOT, `  PID      : ${process.pid}`);
  log(LEVELS.BOOT, '─────────────────────────────────────────');
}

// ─── Child process management ─────────────────────────────────────────────────

function startBot() {
  if (shuttingDown) return;

  lastStart = Date.now();
  log(LEVELS.INFO,
    `Spawning bot process`,
    restarts > 0 ? `(restart #${restarts}/${CONFIG.maxRestarts})` : '(initial start)'
  );

  child = spawn(process.execPath, [CONFIG.script], {
    cwd:   __dirname,
    stdio: 'inherit',          // pass-through: Pterodactyl / PM2 see all output
    env:   { ...process.env }, // full env clone — no secrets dropped
    detached: false,           // child dies with launcher on abrupt kill
  });

  child.on('error', err => {
    log(LEVELS.ERROR, `Failed to spawn child process: ${err.message}`);
    scheduleRestart(1);
  });

  child.on('exit', (code, signal) => {
    const uptime = Date.now() - lastStart;
    child = null;

    if (shuttingDown) {
      log(LEVELS.INFO, 'Bot process stopped cleanly (shutdown in progress).');
      process.exit(0);
    }

    if (signal === 'SIGKILL' && code === null) {
      // Pterodactyl or OS killed the child — treat as hard crash
      log(LEVELS.WARN, `Child was SIGKILL'd after ${formatMs(uptime)} — scheduling restart.`);
    } else {
      log(LEVELS.WARN,
        `Bot exited — code: ${code ?? 'null'}, signal: ${signal ?? 'none'},`,
        `uptime: ${formatMs(uptime)}`
      );
    }

    // If process ran stably long enough, treat as first crash
    if (uptime >= CONFIG.stableUptimeMs) {
      log(LEVELS.INFO, `Process was stable for ${formatMs(uptime)} — resetting restart counter.`);
      restarts = 0;
    }

    // Exit code 0 from the bot means it shut down intentionally — don't restart
    if (code === 0 && signal === null) {
      log(LEVELS.INFO, 'Bot exited cleanly (code 0) — not restarting.');
      process.exit(0);
    }

    scheduleRestart(code);
  });
}

function scheduleRestart(exitCode) {
  if (restarts >= CONFIG.maxRestarts) {
    log(LEVELS.ERROR,
      `Maximum restarts (${CONFIG.maxRestarts}) reached.`,
      'Fix the underlying error and restart the server manually.'
    );
    process.exit(exitCode ?? 1);
  }

  const delay = backoffDelay();
  restarts++;
  log(LEVELS.INFO, `Waiting ${formatMs(delay)} before restart ${restarts}/${CONFIG.maxRestarts}...`);

  restartTimer = setTimeout(() => {
    restartTimer = null;
    startBot();
  }, delay);
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown(signal) {
  if (shuttingDown) return; // already handling
  shuttingDown = true;

  log(LEVELS.INFO, `Received ${signal} — initiating graceful shutdown...`);

  // Cancel any pending restart timer
  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }

  if (!child) {
    log(LEVELS.INFO, 'No child process running — exiting now.');
    process.exit(0);
  }

  // Give child a chance to shut down gracefully
  log(LEVELS.INFO, `Sending SIGTERM to child (PID ${child.pid})...`);
  try { child.kill('SIGTERM'); } catch (_) {}

  // Escalate to SIGKILL if child doesn't exit within the grace period
  const forceKill = setTimeout(() => {
    if (child) {
      log(LEVELS.WARN,
        `Child did not exit within ${formatMs(CONFIG.gracePeriodMs)} — sending SIGKILL.`
      );
      try { child.kill('SIGKILL'); } catch (_) {}
    }
    setTimeout(() => process.exit(0), 500);
  }, CONFIG.gracePeriodMs);

  // If child exits before force-kill fires, cancel the timer
  const waitExit = setInterval(() => {
    if (!child) {
      clearTimeout(forceKill);
      clearInterval(waitExit);
      log(LEVELS.INFO, 'Child exited gracefully — launcher done.');
      process.exit(0);
    }
  }, 200);
}

// ─── Launcher-level safety net ────────────────────────────────────────────────

process.on('uncaughtException', err => {
  log(LEVELS.ERROR, `Uncaught exception in launcher:\n${err.stack || err.message}`);
  // Don't crash the launcher — the child is still running
});

process.on('unhandledRejection', (reason) => {
  log(LEVELS.ERROR, `Unhandled rejection in launcher: ${reason}`);
});

// ─── Signal hooks (Pterodactyl / Docker / systemd compatible) ─────────────────

process.on('SIGTERM', () => shutdown('SIGTERM')); // Pterodactyl stop / docker stop
process.on('SIGINT',  () => shutdown('SIGINT'));  // Ctrl+C
process.on('SIGHUP',  () => {                     // terminal hangup — treat as restart
  log(LEVELS.INFO, 'SIGHUP received — restarting bot process...');
  if (child) {
    try { child.kill('SIGTERM'); } catch (_) {}
  }
  // child exit handler will trigger startBot() automatically
});

// ─── Entry point ──────────────────────────────────────────────────────────────

printBanner();
checkNodeVersion();
validateEnv();
startBot();
