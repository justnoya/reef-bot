---
name: ReefBot DB Migration
description: PostgreSQL migration details for reef-v3 Discord bot — adapter API, table layout, and key decisions
---

## What was done
Replaced MongoDB (mongoose), quickmongo, currency-system, and quick.db with `pg` (node-postgres).

**Central module:** `util/db.js` — exports all model classes and `PgCurrencySystem`.

## Table layout
- `users` — userId, blacklisted, count, wallet, bank, space, daily_*, voted_*, crates_*, badge_*
- `guilds` — guild_id, prefix, banned[]
- `welcomer` — guild_id, enabled (TEXT not bool), channel, message
- `badges` — user_id, owner, developer, staff, bughunter, supporter, friend
- `economy_cooldowns` — (user_id, action) PK, last_used BIGINT, streak
- `shop_items` — id SERIAL, guild_id (default 'global'), name, price, description
- `user_inventory` — (user_id, guild_id, item_name) PK, quantity
- `kv_store` — key TEXT PK, value TEXT (JSON stringified)

## Adapter API (mongoose-compatible)
- `User.findOne({ userId })` / `new User({ userId })` + `.save()` / `User.create({ userId })`
- `Guild.findOne({ guildID })` / same pattern
- `Welcomer.findOne({ guild })` / `Welcomer.updateOne({ guild }, updates)` / `new Welcomer({}).save()`
- `KVStore` — `.get(key)`, `.set(key, val)`, `.delete(key)`, `.connect()`, `.on('ready', cb)`

## client.db (KVStore keys used)
- `prefix_${guildId}` — custom prefix
- `uprem_${userId}`, `upremend_${userId}`, `upremcount_${userId}`, `upremserver_${userId}` — user premium
- `sprem_${guildId}`, `spremend_${guildId}`, `spremown_${guildId}` — server premium

**Why:** DATABASE_URL is already set as Replit secret. SSL conditional on localhost check.

**How to apply:** `require('../util/db')` — import named exports. `initDB()` is called once in index.js at startup.
