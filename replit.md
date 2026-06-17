# ReeF Bot (Cybork)

A Discord bot with economy, music, moderation, and welcome features.

## Running the bot

The bot starts via `node start.js` (or `npm start`). `start.js` is the production
launcher — it validates environment, auto-restarts on crash, and handles graceful
shutdown for Pterodactyl Panel / Docker / bare VPS.

## Environment variables

See `.env.example` for the full reference with descriptions for every variable.

There are three ways to supply variables (priority: highest → lowest):

| Method | How |
|---|---|
| **Panel / system** | Pterodactyl env tab, Replit Secrets, Docker `-e` flags |
| **`api.json`** | Fill in the values in `api.json` in the project root |
| **`.env`** | Copy `.env.example` → `.env` and fill in values |

### Required

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Bot authentication token (Discord Developer Portal → Bot → Token) |
| `DATABASE_URL` | PostgreSQL connection string — auto-provided on Replit |

### Optional

| Variable | Description |
|---|---|
| `TOPGG_API` | Top.gg API token for stats posting and vote tracking |
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | Individual PG vars — only needed if not using `DATABASE_URL` |

## Project structure

```
start.js          — Production launcher (use this to start the bot)
index.js          — Bot entry point (spawned by start.js)
api.json          — JSON config file (alternative to .env)
.env.example      — Documented template for all environment variables
config.json       — Bot config (prefix, owner IDs, webhook URLs)
commands/         — Prefix commands (by category)
SlashCommands/    — Slash command implementations
events/           — Discord event handlers
handlers/         — Command/event loader logic
util/             — Helpers, database layer, music setup
V2components/     — Discord Components V2 builder classes
```

## User preferences

- Keep the existing project structure (commands/, events/, handlers/, SlashCommands/, util/)
