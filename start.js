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
const fs          = require('fs');

// ─── Config source loading (runs before everything else) ──────────────────────
// Priority (highest → lowest):
//   1. System / panel environment variables  (Pterodactyl, Replit Secrets, Docker)
//   2. api.json                              (explicit JSON config file)
//   3. .env                                  (dotenv fallback)
// A value already in process.env is NEVER overridden by a file source.

const _configSources = [];

// ── Source 2: api.json ────────────────────────────────────────────────────────
const _apiJsonPath = path.join(__dirname, 'api.json');
if (fs.existsSync(_apiJsonPath)) {
  try {
    const _apiData = JSON.parse(fs.readFileSync(_apiJsonPath, 'utf8'));
    let _loaded = 0;
    for (const [k, v] of Object.entries(_apiData)) {
      if (typeof v === 'string' && v.trim() !== '' && !process.env[k]) {
        process.env[k] = v;
        _loaded++;
      }
    }
    _configSources.push(`api.json (${_loaded} var${_loaded !== 1 ? 's' : ''})`);
  } catch (err) {
    _configSources.push(`api.json (parse error: ${err.message})`);
  }
}

// ── Source 3: .env ────────────────────────────────────────────────────────────
try {
  const _result = require('dotenv').config({
    path:     path.join(__dirname, '.env'),
    override: false,   // never stomp system vars or api.json values
  });
  if (!_result.error) {
    const _count = Object.keys(_result.parsed || {}).length;
    _configSources.push(`.env (${_count} var${_count !== 1 ? 's' : ''})`);
  }
} catch (_) {
  // dotenv not installed — that's fine; api.json or panel vars cover it
}

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  /** Entry point to launch */
  script: path.join(__dirname, 'index.js'),

  /** Required environment variables — launcher exits if any are missing */
  requiredEnvVars: ['DISCORD_TOKEN'],

  /** Optional env vars — warns if absent but does not block startup */
  optionalEnvVars: ['DATABASE_URL', 'TOPGG_API'],

  /** Minimum Node.js version — driven by distube v4 (>=18.17.0) */
  minNodeVersion: '18.17.0',

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
  const parse  = v => v.split('.').map(Number);
  const [cMaj, cMin, cPat] = parse(process.versions.node);
  const [rMaj, rMin, rPat] = parse(CONFIG.minNodeVersion);

  const tooOld =
    cMaj < rMaj ||
    (cMaj === rMaj && cMin < rMin) ||
    (cMaj === rMaj && cMin === rMin && cPat < rPat);

  if (tooOld) {
    log(LEVELS.ERROR,
      `Node.js v${process.versions.node} is too old.`,
      `Required: v${CONFIG.minNodeVersion}+ (strictest dep: distube v4). Please upgrade.`
    );
    process.exit(1);
  }
  log(LEVELS.BOOT, `Node.js ${process.versions.node} ≥ ${CONFIG.minNodeVersion} — OK`);
}

function validateEnv() {
  const missing = CONFIG.requiredEnvVars.filter(k => !process.env[k]);
  if (missing.length > 0) {
    log(LEVELS.ERROR, `Missing required environment variables: ${missing.join(', ')}`);
    log(LEVELS.ERROR, 'Add them to api.json, a .env file, or your panel\'s environment settings.');
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
  log(LEVELS.BOOT, `  Config   : ${_configSources.length ? _configSources.join(', ') : 'system env only'}`);
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
