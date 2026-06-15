const discord = require("discord.js");
const { readdirSync } = require("fs");
const { EmbedBuilder, WebhookClient, GatewayIntentBits } = require('discord.js');
const { Webhooks: { bot_error, webhook_error } } = require('./config.json');

require("dotenv").config();

const { KVStore, initDB } = require('./util/db');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN || null;
const TOPGG_API     = process.env.TOPGG_API     || null;

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

client.config       = require("./config.json");
client.commands     = new discord.Collection();
client.noprefix     = client.config.noprefix;
client.emoji        = require('./util/emoji.json');
client.categories   = readdirSync("./commands/");
client.scategories  = readdirSync("./SlashCommands/");
client.prefix       = client.config.prefix;
client.phone        = new discord.Collection();
client.aliases      = new discord.Collection();
client.cooldowns    = new discord.Collection();
client.slash        = new discord.Collection();
client.logger       = require('./util/logger.js');
client.db           = new KVStore();

const Topgg = require("@top-gg/sdk");
client.topgg = TOPGG_API ? new Topgg.Api(TOPGG_API) : null;

client.userSettings = new discord.Collection();
client.fuLoops = new Map();

initDB().then(() => {
  client.logger.log('PostgreSQL connected and tables ready');
}).catch(err => {
  client.logger.log(`PostgreSQL connection failed: ${err.message}`, 'error');
});

if (!DISCORD_TOKEN) {
  client.logger.log('DISCORD_TOKEN is not set — cannot login.', 'error');
  process.exit(1);
}

client.login(DISCORD_TOKEN).catch(e => client.logger.log(`Login error: ${e.message}`, 'error'));

client.on("message", async message => {
  try {
    const hasText  = Boolean(message.content);
    const hasImage = message.attachments.size !== 0;
    const hasEmbed = message.embeds.length !== 0;
    if (message.author.bot || (!hasText && !hasImage && !hasEmbed)) return;
    const origin    = client.phone.find(call => call.origin.id === message.channel.id);
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
  try { thread.join(); } catch (e) {}
});

let web, weeb;
try { web  = new WebhookClient({ url: bot_error     }); } catch (e) {}
try { weeb = new WebhookClient({ url: webhook_error }); } catch (e) {}

if (TOPGG_API) {
  try {
    const { AutoPoster } = require('topgg-autoposter');
    const poster = AutoPoster(TOPGG_API, client);
    poster.on('posted', stats => {
      client.logger.log(`Top.gg stats posted · ${stats.serverCount} servers`);
      if (weeb) weeb.send({ content: `Posted stats to Top.gg | ${stats.serverCount} servers` }).catch(() => {});
    });
    poster.on('error', err => {
      client.logger.log(`Top.gg post failed: ${err.message}`, 'warn');
    });
  } catch (e) {
    client.logger.log(`Top.gg autoposter skipped: ${e.message}`, 'warn');
  }
} else {
  client.logger.log('Top.gg autoposter disabled (TOPGG_API not set)', 'warn');
}

process.on('unhandledRejection', error => {
  if (web) {
    try { web.send({ content: `\`\`\`js\n${error}\`\`\`` }).catch(() => {}); } catch (e) {}
  }
  client.logger.log(`Unhandled rejection: ${error}`, 'error');
});

["commands", "slash", "events"].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});
