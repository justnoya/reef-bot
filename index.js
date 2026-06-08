const discord = require("discord.js");
const { readdirSync } = require("fs");
const { EmbedBuilder, WebhookClient, GatewayIntentBits } = require('discord.js');
const { Webhooks: { bot_error, webhook_error } } = require('./config.json');

require("dotenv").config();

const { KVStore, initDB } = require('./util/db');
const moment = require("moment");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'TOKEN';
const TOPGG_API = process.env.TOPGG_API || 'API';

const client = new discord.Client({
  restWsBridgetimeout: 100,
  failIfNotExists: false,
  makeCache: discord.Options.cacheEverything(),
  allowedMentions: {
    parse: ["roles", "users", "everyone"],
    repliedUser: false,
  },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
  ],
  ws: { properties: { browser: "Discord Android" } }
});

client.config = require("./config.json");
client.commands = new discord.Collection();
client.noprefix = client.config.noprefix;
client.emoji = require('./util/emoji.json');
client.categories = readdirSync("./commands/");
client.scategories = readdirSync("./SlashCommands/");
client.prefix = client.config.prefix;
client.phone = new discord.Collection();
client.aliases = new discord.Collection();
client.cooldowns = new discord.Collection();
client.slash = new discord.Collection();
client.logger = require('./util/logger.js');

client.db = new KVStore();

const Topgg = require("@top-gg/sdk");
client.topgg = new Topgg.Api(TOPGG_API);

client.userSettings = new discord.Collection();

initDB().then(() => {
  client.logger.log('[DB] PostgreSQL connected and tables ready');
}).catch(err => {
  console.error('[DB] Failed to initialize PostgreSQL:', err);
});

client.login(DISCORD_TOKEN).catch(e => console.log('Login error:', e));

client.on("message", async message => {
  try {
    const hasText = Boolean(message.content);
    const hasImage = message.attachments.size !== 0;
    const hasEmbed = message.embeds.length !== 0;
    if (message.author.bot || (!hasText && !hasImage && !hasEmbed)) return;
    const origin = client.phone.find(call => call.origin.id === message.channel.id);
    const recipient = client.phone.find(call => call.recipient.id === message.channel.id);
    if (!origin && !recipient) return;
    const call = origin || recipient;
    if (!call.active) return;
    await call.send(origin ? call.recipient : call.origin, message, hasText, hasImage, hasEmbed);
  } catch { return; }
});

try {
  const automodF = require(`${process.cwd()}/automod/automod-execute`);
  client.on('messageCreate', (...args) => automodF.run(client, ...args));
} catch (e) {}

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'DELETE_BUT') {
      const em = new EmbedBuilder().setDescription('Only Bot Owner Can Use This Button').setColor('#ff0000');
      if (client.config.owner.includes(interaction.member?.user?.id))
        return interaction.message.delete();
      else
        return interaction.reply({ embeds: [em], ephemeral: true });
    }
  }
});

client.on("threadCreate", thread => {
  try { thread.join(); } catch (e) { console.log(e.message); }
});

let web, weeb;
try { web = new WebhookClient({ url: bot_error }); } catch (e) {}
try { weeb = new WebhookClient({ url: webhook_error }); } catch (e) {}

const { AutoPoster } = require('topgg-autoposter');
try {
  const poster = AutoPoster(TOPGG_API, client);
  poster.on('posted', stats => {
    if (weeb) weeb.send({ content: `Posted stats to Top.gg | ${stats.serverCount} servers` }).catch(() => {});
  });
} catch (e) { console.log('Top.gg autoposter skipped:', e.message); }

process.on('unhandledRejection', error => {
  if (web) {
    try { web.send({ content: `\`\`\`js\n${error}\`\`\`` }).catch(() => {}); } catch (e) {}
  }
  console.log(error);
});

["commands", "slash", "events"].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});
