const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      blacklisted BOOLEAN DEFAULT FALSE,
      count INTEGER DEFAULT 0,
      wallet INTEGER DEFAULT 0,
      bank INTEGER DEFAULT 0,
      space INTEGER DEFAULT 10000,
      daily_time BIGINT DEFAULT 0,
      daily_streak INTEGER DEFAULT 0,
      voted_at BIGINT DEFAULT 0,
      total_votes INTEGER DEFAULT 0,
      bronze_crate INTEGER DEFAULT 0,
      silver_crate INTEGER DEFAULT 0,
      golden_crate INTEGER DEFAULT 0,
      diamond_crate INTEGER DEFAULT 0,
      deluxe_crate INTEGER DEFAULT 0,
      badge_dev BOOLEAN DEFAULT FALSE,
      badge_mod BOOLEAN DEFAULT FALSE,
      badge_owner BOOLEAN DEFAULT FALSE,
      badge_supporter BOOLEAN DEFAULT FALSE,
      badge_bug BOOLEAN DEFAULT FALSE,
      badge_premium BOOLEAN DEFAULT FALSE,
      badge_user BOOLEAN DEFAULT TRUE,
      badge_staff BOOLEAN DEFAULT FALSE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS guilds (
      guild_id TEXT PRIMARY KEY,
      prefix TEXT DEFAULT '!',
      banned TEXT[] DEFAULT ARRAY[]::TEXT[]
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS welcomer (
      guild_id TEXT PRIMARY KEY,
      enabled TEXT DEFAULT 'true',
      channel TEXT,
      message TEXT DEFAULT '<<user.name>> welcome to <<guild.name>>.
Total Members: <<guild.mc>>'
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS badges (
      user_id TEXT PRIMARY KEY,
      owner BOOLEAN DEFAULT FALSE,
      developer BOOLEAN DEFAULT FALSE,
      staff BOOLEAN DEFAULT FALSE,
      bughunter BOOLEAN DEFAULT FALSE,
      supporter BOOLEAN DEFAULT FALSE,
      friend BOOLEAN DEFAULT FALSE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS economy_cooldowns (
      user_id TEXT,
      action TEXT,
      last_used BIGINT DEFAULT 0,
      streak INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, action)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id SERIAL PRIMARY KEY,
      guild_id TEXT DEFAULT 'global',
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT DEFAULT 'No Description'
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_inventory (
      user_id TEXT,
      guild_id TEXT DEFAULT 'global',
      item_name TEXT,
      quantity INTEGER DEFAULT 1,
      PRIMARY KEY (user_id, guild_id, item_name)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  console.log('[DB] PostgreSQL tables initialized');
}

class UserRecord {
  constructor(data) {
    this.userId = data.user_id || data.userId;
    this.blacklisted = data.blacklisted ?? false;
    this.count = data.count ?? 0;
    this.wallet = data.wallet ?? 0;
    this.bank = data.bank ?? 0;
    this.space = data.space ?? 10000;
    this.daily = {
      dailyTime: data.daily_time ?? 0,
      dailyStreak: data.daily_streak ?? 0
    };
    this.vote = {
      votedAt: data.voted_at ?? 0,
      totalVotes: data.total_votes ?? 0
    };
    this.crates = {
      bronzecrate: data.bronze_crate ?? 0,
      silvercrate: data.silver_crate ?? 0,
      goldencrate: data.golden_crate ?? 0,
      diamondcrate: data.diamond_crate ?? 0,
      deluxecrate: data.deluxe_crate ?? 0
    };
    this.badge = {
      dev: data.badge_dev ?? false,
      mod: data.badge_mod ?? false,
      owner: data.badge_owner ?? false,
      supporter: data.badge_supporter ?? false,
      bug: data.badge_bug ?? false,
      premium: data.badge_premium ?? false,
      user: data.badge_user ?? true,
      staff: data.badge_staff ?? false
    };
  }

  async save() {
    await query(`
      INSERT INTO users (
        user_id, blacklisted, count, wallet, bank, space,
        daily_time, daily_streak, voted_at, total_votes,
        bronze_crate, silver_crate, golden_crate, diamond_crate, deluxe_crate,
        badge_dev, badge_mod, badge_owner, badge_supporter, badge_bug,
        badge_premium, badge_user, badge_staff
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      ON CONFLICT (user_id) DO UPDATE SET
        blacklisted = EXCLUDED.blacklisted,
        count = EXCLUDED.count,
        wallet = EXCLUDED.wallet,
        bank = EXCLUDED.bank,
        space = EXCLUDED.space,
        daily_time = EXCLUDED.daily_time,
        daily_streak = EXCLUDED.daily_streak,
        voted_at = EXCLUDED.voted_at,
        total_votes = EXCLUDED.total_votes,
        bronze_crate = EXCLUDED.bronze_crate,
        silver_crate = EXCLUDED.silver_crate,
        golden_crate = EXCLUDED.golden_crate,
        diamond_crate = EXCLUDED.diamond_crate,
        deluxe_crate = EXCLUDED.deluxe_crate,
        badge_dev = EXCLUDED.badge_dev,
        badge_mod = EXCLUDED.badge_mod,
        badge_owner = EXCLUDED.badge_owner,
        badge_supporter = EXCLUDED.badge_supporter,
        badge_bug = EXCLUDED.badge_bug,
        badge_premium = EXCLUDED.badge_premium,
        badge_user = EXCLUDED.badge_user,
        badge_staff = EXCLUDED.badge_staff
    `, [
      this.userId, this.blacklisted, this.count, this.wallet, this.bank, this.space,
      this.daily.dailyTime, this.daily.dailyStreak,
      this.vote.votedAt, this.vote.totalVotes,
      this.crates.bronzecrate, this.crates.silvercrate, this.crates.goldencrate,
      this.crates.diamondcrate, this.crates.deluxecrate,
      this.badge.dev, this.badge.mod, this.badge.owner, this.badge.supporter,
      this.badge.bug, this.badge.premium, this.badge.user, this.badge.staff
    ]);
    return this;
  }
}

class User extends UserRecord {
  constructor(data) {
    super({ user_id: data.userId || data.user_id });
  }

  static async findOne({ userId }) {
    const res = await query('SELECT * FROM users WHERE user_id = $1', [userId]);
    if (res.rows.length === 0) return null;
    return new UserRecord(res.rows[0]);
  }

  static async create({ userId }) {
    const rec = new UserRecord({ user_id: userId });
    await rec.save();
    return rec;
  }
}

class GuildRecord {
  constructor(data) {
    this.guildID = data.guild_id || data.guildID;
    this.prefix = data.prefix ?? '!';
    this.banned = data.banned ?? [];
  }

  async save() {
    await query(`
      INSERT INTO guilds (guild_id, prefix, banned) VALUES ($1, $2, $3)
      ON CONFLICT (guild_id) DO UPDATE SET prefix = $2, banned = $3
    `, [this.guildID, this.prefix, this.banned]);
    return this;
  }
}

class Guild extends GuildRecord {
  constructor(data) {
    super({ guild_id: data.guildID || data.guild_id });
  }

  static async findOne({ guildID }) {
    const res = await query('SELECT * FROM guilds WHERE guild_id = $1', [guildID]);
    if (res.rows.length === 0) return null;
    return new GuildRecord(res.rows[0]);
  }

  static async create({ guildID }) {
    const rec = new GuildRecord({ guild_id: guildID });
    await rec.save();
    return rec;
  }
}

class WelcomerRecord {
  constructor(data) {
    this.guild = data.guild_id || data.guild;
    this.enabled = data.enabled ?? 'true';
    this.channel = data.channel ?? null;
    this.message = data.message ?? '<<user.name>> welcome to <<guild.name>>.\nTotal Members: <<guild.mc>>';
  }

  async save() {
    await query(`
      INSERT INTO welcomer (guild_id, enabled, channel, message) VALUES ($1, $2, $3, $4)
      ON CONFLICT (guild_id) DO UPDATE SET enabled = $2, channel = $3, message = $4
    `, [this.guild, this.enabled, this.channel, this.message]);
    return this;
  }
}

class Welcomer extends WelcomerRecord {
  constructor(data) {
    super({ guild_id: data.guild, enabled: String(data.enabled ?? 'true'), channel: data.channel });
  }

  static async findOne({ guild }) {
    const res = await query('SELECT * FROM welcomer WHERE guild_id = $1', [guild]);
    if (res.rows.length === 0) return null;
    return new WelcomerRecord(res.rows[0]);
  }

  static async updateOne({ guild }, updates) {
    const colMap = { enabled: 'enabled', channel: 'channel', message: 'message' };
    const setClauses = [];
    const values = [guild];
    for (const [key, val] of Object.entries(updates)) {
      const col = colMap[key] || key;
      setClauses.push(`${col} = $${values.length + 1}`);
      values.push(typeof val === 'boolean' ? String(val) : val);
    }
    if (setClauses.length === 0) return;
    await query(`UPDATE welcomer SET ${setClauses.join(', ')} WHERE guild_id = $1`, values);
  }
}

class BadgesRecord {
  constructor(data) {
    this.userId = data.user_id || data.userId;
    this.owner = data.owner ?? false;
    this.developer = data.developer ?? false;
    this.staff = data.staff ?? false;
    this.bughunter = data.bughunter ?? false;
    this.supporter = data.supporter ?? false;
    this.friend = data.friend ?? false;
  }

  async save() {
    await query(`
      INSERT INTO badges (user_id, owner, developer, staff, bughunter, supporter, friend)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (user_id) DO UPDATE SET
        owner=$2, developer=$3, staff=$4, bughunter=$5, supporter=$6, friend=$7
    `, [this.userId, this.owner, this.developer, this.staff, this.bughunter, this.supporter, this.friend]);
    return this;
  }
}

class Badges extends BadgesRecord {
  constructor(data) {
    super({ user_id: data.userId || data.user_id });
  }

  static async findOne({ userId }) {
    const res = await query('SELECT * FROM badges WHERE user_id = $1', [userId]);
    if (res.rows.length === 0) return null;
    return new BadgesRecord(res.rows[0]);
  }
}

class EconomyRecord {
  constructor(data) {
    this.userId = data.user_id || data.userId;
    this.amount = data.amount ?? 0;
  }

  async save() {
    await query(`
      INSERT INTO users (user_id, wallet) VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET wallet = $2
    `, [this.userId, this.amount]);
    return this;
  }
}

class Economy extends EconomyRecord {
  constructor(data) {
    super({ user_id: data.userId || data.user_id });
  }

  static async findOne({ userId }) {
    const res = await query('SELECT user_id, wallet as amount FROM users WHERE user_id = $1', [userId]);
    if (res.rows.length === 0) return null;
    return new EconomyRecord(res.rows[0]);
  }
}

class KVStore {
  constructor() {
    this._eventHandlers = {};
  }

  on(event, cb) {
    this._eventHandlers[event] = cb;
    return this;
  }

  async connect() {
    await initDB();
    if (this._eventHandlers['ready']) this._eventHandlers['ready']();
    return this;
  }

  async get(key) {
    try {
      const res = await query('SELECT value FROM kv_store WHERE key = $1', [key]);
      if (res.rows.length === 0) return null;
      try { return JSON.parse(res.rows[0].value); } catch { return res.rows[0].value; }
    } catch { return null; }
  }

  async set(key, value) {
    const v = JSON.stringify(value);
    await query(`
      INSERT INTO kv_store (key, value) VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, [key, v]);
    return this;
  }

  async delete(key) {
    await query('DELETE FROM kv_store WHERE key = $1', [key]);
    return this;
  }

  async has(key) {
    const res = await query('SELECT 1 FROM kv_store WHERE key = $1', [key]);
    return res.rows.length > 0;
  }

  async all() {
    const res = await query('SELECT key, value FROM kv_store');
    return res.rows.map(r => {
      let v;
      try { v = JSON.parse(r.value); } catch { v = r.value; }
      return { id: r.key, value: v };
    });
  }
}

function _formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

async function _getOrCreateUser(userId) {
  const res = await query('SELECT * FROM users WHERE user_id = $1', [userId]);
  if (res.rows.length === 0) {
    await query('INSERT INTO users (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);
    return { user_id: userId, wallet: 0, bank: 0, space: 10000 };
  }
  return res.rows[0];
}

async function _updateUserFields(userId, updates) {
  const cols = Object.keys(updates);
  if (cols.length === 0) return;
  const sets = cols.map((c, i) => `${c} = $${i + 2}`).join(', ');
  await query(`UPDATE users SET ${sets} WHERE user_id = $1`, [userId, ...Object.values(updates)]);
}

async function _getCooldown(userId, action) {
  const res = await query('SELECT * FROM economy_cooldowns WHERE user_id = $1 AND action = $2', [userId, action]);
  return res.rows[0] || null;
}

async function _setCooldown(userId, action, lastUsed, streak = 0) {
  await query(`
    INSERT INTO economy_cooldowns (user_id, action, last_used, streak) VALUES ($1,$2,$3,$4)
    ON CONFLICT (user_id, action) DO UPDATE SET last_used = $3, streak = $4
  `, [userId, action, lastUsed, streak]);
}

class PgCurrencySystem {
  on() { return this; }
  setMongoURL() { return this; }
  setDefaultBankAmount() { return this; }
  setDefaultWalletAmount() { return this; }
  setMaxBankAmount() { return this; }
  setMaxWalletAmount() { return this; }
  searchForNewUpdate() { return this; }

  static get cs() {
    const inst = new PgCurrencySystem();
    return {
      on() { return this; }
    };
  }

  async daily({ user, guild, amount = 100 }) {
    const cd = await _getCooldown(user.id, 'daily');
    const now = Date.now();
    const cooldownMs = 86400000;
    if (cd && now - Number(cd.last_used) < cooldownMs) {
      return { error: true, time: _formatTime(cooldownMs - (now - Number(cd.last_used))) };
    }
    const streak = cd ? Number(cd.streak) + 1 : 1;
    await _setCooldown(user.id, 'daily', now, streak);
    const u = await _getOrCreateUser(user.id);
    await _updateUserFields(user.id, { wallet: (u.wallet || 0) + amount });
    return { error: false, amount, rawData: { streak: { daily: streak } } };
  }

  async beg({ user, guild, minAmount = 20, maxAmount = 100, cooldown = 60 }) {
    const cd = await _getCooldown(user.id, 'beg');
    const now = Date.now();
    const cooldownMs = cooldown * 1000;
    if (cd && now - Number(cd.last_used) < cooldownMs) {
      return { error: true, time: _formatTime(cooldownMs - (now - Number(cd.last_used))) };
    }
    await _setCooldown(user.id, 'beg', now, 0);
    const amount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
    const u = await _getOrCreateUser(user.id);
    await _updateUserFields(user.id, { wallet: (u.wallet || 0) + amount });
    return { error: false, amount };
  }

  async rob({ user, user2, guild, minAmount = 100, successPercentage = 50, cooldown = 25, maxRob = 1000 }) {
    if (!user2) return { error: true, type: 'no-user' };
    const cd = await _getCooldown(user.id, 'rob');
    const now = Date.now();
    const cooldownMs = cooldown * 1000;
    if (cd && now - Number(cd.last_used) < cooldownMs) {
      return { error: true, type: 'time', time: _formatTime(cooldownMs - (now - Number(cd.last_used))) };
    }
    const sender = await _getOrCreateUser(user.id);
    const target = await _getOrCreateUser(user2.id);
    if ((sender.wallet || 0) < minAmount) return { error: true, type: 'low-money', minAmount };
    if ((target.wallet || 0) < minAmount) return { error: true, type: 'low-wallet', minAmount, user2 };
    await _setCooldown(user.id, 'rob', now, 0);
    const success = Math.random() * 100 < successPercentage;
    if (!success) {
      const penalty = Math.min(Math.floor(Math.random() * minAmount) + 1, sender.wallet || 0);
      await _updateUserFields(user.id, { wallet: (sender.wallet || 0) - penalty });
      await _updateUserFields(user2.id, { wallet: (target.wallet || 0) + penalty });
      return { error: true, type: 'caught', amount: penalty, user2 };
    }
    const amount = Math.min(Math.floor(Math.random() * maxRob) + 1, target.wallet || 0);
    await _updateUserFields(user.id, { wallet: (sender.wallet || 0) + amount });
    await _updateUserFields(user2.id, { wallet: (target.wallet || 0) - amount });
    return { error: false, type: 'success', amount, user2 };
  }

  async globalLeaderboard() {
    const res = await query('SELECT user_id, wallet, bank FROM users ORDER BY (wallet + bank) DESC LIMIT 10');
    return res.rows.map(r => ({ userID: r.user_id, wallet: r.wallet || 0, bank: r.bank || 0 }));
  }

  async getShopItems({ guild } = {}) {
    const guildId = guild?.id || 'global';
    const res = await query(
      'SELECT * FROM shop_items WHERE guild_id = $1 OR guild_id = $2 ORDER BY id',
      [guildId, 'global']
    );
    return { inventory: res.rows.map(r => ({ id: r.id, name: r.name, price: r.price, description: r.description })) };
  }

  async getUserItems({ user, guild } = {}) {
    const guildId = guild?.id || 'global';
    const res = await query(`
      SELECT ui.item_name AS name, ui.quantity AS amount, si.price, si.description
      FROM user_inventory ui
      LEFT JOIN shop_items si ON si.name = ui.item_name AND (si.guild_id = ui.guild_id OR si.guild_id = 'global')
      WHERE ui.user_id = $1 AND ui.guild_id = $2
    `, [user.id, guildId]);
    return { inventory: res.rows };
  }

  async addItem({ guild, inventory }) {
    if (!inventory?.name) return { error: true, type: 'No-Inventory-Name' };
    if (!inventory?.price && inventory?.price !== 0) return { error: true, type: 'No-Inventory-Price' };
    if (isNaN(inventory.price) || Number(inventory.price) < 1) return { error: true, type: 'Invalid-Inventory-Price' };
    if (!inventory) return { error: true, type: 'No-Inventory' };
    const guildId = guild?.id || 'global';
    await query(
      'INSERT INTO shop_items (guild_id, name, price, description) VALUES ($1,$2,$3,$4)',
      [guildId, inventory.name, inventory.price, inventory.description || 'No Description']
    );
    return { error: false };
  }

  async buy({ user, guild, item, amount = 1 }) {
    if (!item) return { error: true, type: 'No-Item' };
    if (isNaN(item)) return { error: true, type: 'No-Item' };
    if (!amount || amount < 1) return { error: true, type: 'Invalid-Amount' };
    const guildId = guild?.id || 'global';
    const shopRes = await query(
      'SELECT * FROM shop_items WHERE guild_id = $1 OR guild_id = $2 ORDER BY id',
      [guildId, 'global']
    );
    const shopItem = shopRes.rows[Number(item) - 1];
    if (!shopItem) return { error: true, type: 'Invalid-Item' };
    const u = await _getOrCreateUser(user.id);
    const totalCost = shopItem.price * amount;
    if ((u.wallet || 0) < totalCost) return { error: true, type: 'low-money' };
    await _updateUserFields(user.id, { wallet: (u.wallet || 0) - totalCost });
    await query(`
      INSERT INTO user_inventory (user_id, guild_id, item_name, quantity) VALUES ($1,$2,$3,$4)
      ON CONFLICT (user_id, guild_id, item_name) DO UPDATE SET quantity = user_inventory.quantity + $4
    `, [user.id, guildId, shopItem.name, amount]);
    return { error: false, price: totalCost, inventory: shopItem };
  }

  async balance({ user, guild }) {
    const u = await _getOrCreateUser(user.id);
    return { wallet: u.wallet || 0, bank: u.bank || 0 };
  }

  async withdraw({ user, guild, amount }) {
    if (!amount && amount !== 0) return { error: true, type: 'money' };
    if (amount < 0) return { error: true, type: 'negative-money' };
    const u = await _getOrCreateUser(user.id);
    if ((u.bank || 0) === 0) return { error: true, type: 'no-money' };
    if ((u.bank || 0) < amount) return { error: true, type: 'low-money' };
    const newBank = (u.bank || 0) - amount;
    const newWallet = (u.wallet || 0) + amount;
    await _updateUserFields(user.id, { bank: newBank, wallet: newWallet });
    return { error: false, type: 'all-success', amount, rawData: { wallet: newWallet, bank: newBank } };
  }

  async deposite({ user, guild, amount }) {
    if (!amount && amount !== 0) return { error: true, type: 'money' };
    if (amount < 0) return { error: true, type: 'negative-money' };
    const u = await _getOrCreateUser(user.id);
    if ((u.wallet || 0) === 0) return { error: true, type: 'no-money' };
    if ((u.wallet || 0) < amount) return { error: true, type: 'low-money' };
    const space = u.space || 10000;
    if ((u.bank || 0) >= space) return { error: true, type: 'bank-full' };
    const canDeposit = Math.min(amount, space - (u.bank || 0));
    const newWallet = (u.wallet || 0) - canDeposit;
    const newBank = (u.bank || 0) + canDeposit;
    await _updateUserFields(user.id, { bank: newBank, wallet: newWallet });
    const type = canDeposit < amount ? 'success' : 'all-success';
    return { error: false, type, amount: canDeposit, rawData: { wallet: newWallet, bank: newBank } };
  }

  async removeUserItem({ user, item, guild, amount = 1 }) {
    const guildId = guild?.id || 'global';
    const items = await this.getUserItems({ user, guild });
    const invItem = items.inventory[Number(item) - 1];
    if (!invItem) return { error: true };
    const newQty = invItem.amount - amount;
    if (newQty <= 0) {
      await query(
        'DELETE FROM user_inventory WHERE user_id=$1 AND guild_id=$2 AND item_name=$3',
        [user.id, guildId, invItem.name]
      );
    } else {
      await query(
        'UPDATE user_inventory SET quantity=$1 WHERE user_id=$2 AND guild_id=$3 AND item_name=$4',
        [newQty, user.id, guildId, invItem.name]
      );
    }
    const u = await _getOrCreateUser(user.id);
    return { error: false, rawData: { bankSpace: u.space || 10000 } };
  }

  async setBankSpace(userId, guildId, amount) {
    await _updateUserFields(userId, { space: amount });
    return { error: false, amount };
  }
}

module.exports = {
  pool,
  query,
  initDB,
  User,
  UserRecord,
  Guild,
  GuildRecord,
  Welcomer,
  WelcomerRecord,
  Badges,
  BadgesRecord,
  Economy,
  EconomyRecord,
  KVStore,
  PgCurrencySystem
};
