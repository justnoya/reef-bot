'use strict';

/**
 * start.js — Production launcher for Cybork (ReeF Bot)
 *
 * Works in any environment: Pterodactyl Panel, PM2, bare Node.js, Docker, VPS.
 *
 * Responsibilities:
 *   • Node.js version enforcement
 *   • Spawning index.js as an isolated child process
 *   • Auto-restart with exponential back-off on crash
 *   • Stable-uptime detection — resets restart counter after a clean run
 *   • Graceful SIGTERM / SIGINT forwarding (Pterodactyl Panel compatible)
 *   • Force-SIGKILL if child ignores SIGTERM after timeout
 *   • Launcher-level uncaughtException / unhandledRejection guards
 *
 * Environment variables (api.json / .env / panel) are loaded inside index.js
 * so they are available globally to every part of the bot from startup.
 */

const { spawn, execSync } = require('child_process');
const path                = require('path');
const os                  = require('os');
const fs                  = require('fs');

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  /** Entry point to launch */
  script: path.join(__dirname, 'index.js'),

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

function ensureModules() {
  const marker = path.join(__dirname, 'node_modules', 'discord.js');
  if (!fs.existsSync(marker)) {
    log(LEVELS.BOOT, 'node_modules missing or incomplete — running npm install...');
    log(LEVELS.BOOT, 'This may take a minute on first start. Please wait...');
    try {
      execSync('npm install --prefer-offline', {
        cwd:   __dirname,
        stdio: 'inherit',
      });
      log(LEVELS.BOOT, 'npm install completed — continuing startup.');
    } catch (err) {
      log(LEVELS.ERROR, 'npm install failed. Check your network and package.json.');
      log(LEVELS.ERROR, err.message);
      process.exit(1);
    }
  } else {
    log(LEVELS.BOOT, 'node_modules present — OK');
  }
}

function checkNodeVersion() {
  const parse = v => v.split('.').map(Number);
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
  log(LEVELS.BOOT, `Node.js ${process.versions.node} >= ${CONFIG.minNodeVersion} — OK`);
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
    cwd:      __dirname,
    stdio:    'inherit',          // pass-through: Pterodactyl / PM2 see all output
    env:      { ...process.env }, // full env clone — panel vars always included
    detached: false,              // child dies with launcher on abrupt kill
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
      log(LEVELS.WARN, `Child was SIGKILL'd after ${formatMs(uptime)} — scheduling restart.`);
    } else {
      log(LEVELS.WARN,
        `Bot exited — code: ${code ?? 'null'}, signal: ${signal ?? 'none'},`,
        `uptime: ${formatMs(uptime)}`
      );
    }

    if (uptime >= CONFIG.stableUptimeMs) {
      log(LEVELS.INFO, `Process was stable for ${formatMs(uptime)} — resetting restart counter.`);
      restarts = 0;
    }

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
  if (shuttingDown) return;
  shuttingDown = true;

  log(LEVELS.INFO, `Received ${signal} — initiating graceful shutdown...`);

  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }

  if (!child) {
    log(LEVELS.INFO, 'No child process running — exiting now.');
    process.exit(0);
  }

  log(LEVELS.INFO, `Sending SIGTERM to child (PID ${child.pid})...`);
  try { child.kill('SIGTERM'); } catch (_) {}

  const forceKill = setTimeout(() => {
    if (child) {
      log(LEVELS.WARN,
        `Child did not exit within ${formatMs(CONFIG.gracePeriodMs)} — sending SIGKILL.`
      );
      try { child.kill('SIGKILL'); } catch (_) {}
    }
    setTimeout(() => process.exit(0), 500);
  }, CONFIG.gracePeriodMs);

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
});

process.on('unhandledRejection', reason => {
  log(LEVELS.ERROR, `Unhandled rejection in launcher: ${reason}`);
});

// ─── Signal hooks (Pterodactyl / Docker / systemd compatible) ─────────────────

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGHUP',  () => {
  log(LEVELS.INFO, 'SIGHUP received — restarting bot process...');
  if (child) {
    try { child.kill('SIGTERM'); } catch (_) {}
  }
});

// ─── Entry point ──────────────────────────────────────────────────────────────

printBanner();
checkNodeVersion();
ensureModules();
startBot();
