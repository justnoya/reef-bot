const { Container, TextDisplay, Separator, Section, Thumbnail, ActionRow, Button, IS_COMPONENTS_V2 } = require('../../V2components');
const packageJSON = require("../../package.json");
const os = require('os');

module.exports = {
  name: "stats",
  category: 'info',
  cooldown: 5,
  botPerms: ['ViewChannel', 'EmbedLinks', 'UseExternalEmojis'],
  userPerms: ['ViewChannel'],
  description: "Stats and information about the bot",
  aliases: ['stats', 'bi', 'botinfo'],
  run: async (client, message) => {
    const accent = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    let users = 0;
    client.guilds.cache.forEach(g => { users += g.memberCount; });

    const uptime   = Math.round((Date.now() - client.uptime) / 1000);
    const ram      = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const inviteURL  = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`;
    const supportURL = client.config.links.dc;
    const djsVer   = packageJSON.dependencies["discord.js"];

    const linkRow = new ActionRow().addComponents(
      new Button().setLabel('Invite Bot').setURL(inviteURL),
      new Button().setLabel('Support Server').setURL(supportURL),
    );

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new Section()
          .addComponents(
            new TextDisplay(`## ${client.user.username}`),
            new TextDisplay(`Multi-purpose Discord bot`)
          )
          .setAccessory(new Thumbnail().setURL(client.user.displayAvatarURL())),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `**Statistics**\n` +
          `➜ Servers: \`${client.guilds.cache.size}\`\n` +
          `➜ Users: \`${users}\`\n` +
          `➜ Channels: \`${client.channels.cache.size}\`\n` +
          `➜ Commands: \`${client.commands.size}\``
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(
          `**System**\n` +
          `➜ Ping: \`${client.ws.ping}ms\`\n` +
          `➜ RAM: \`${ram} MB\`\n` +
          `➜ Node.js: \`${process.version}\`\n` +
          `➜ discord.js: \`${djsVer}\`\n` +
          `➜ Platform: \`${os.platform()}\`\n` +
          `➜ Uptime: <t:${uptime}:R>`
        ),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(`*Thank you for using ${client.user.username} ♡*`),
        linkRow
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
