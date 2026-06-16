const { Container, TextDisplay, Separator, Section, Thumbnail, IS_COMPONENTS_V2 } = require('../../V2components');
const ms = require('ms');

module.exports = {
  name: "uptime",
  aliases: ["u"],
  description: "Bot uptime and last reboot time",
  args: false,
  usage: "uptime",
  category: 'info',
  cooldown: 5,
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  run: async (client, message) => {
    const accent = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;
    const d = Math.round((Date.now() - client.uptime) / 1000);

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new Section()
          .addComponents(
            new TextDisplay(`## Uptime`),
            new TextDisplay(`${client.user.username} is online`)
          )
          .setAccessory(new Thumbnail().setURL(client.user.displayAvatarURL())),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **Duration:** \`${ms(client.uptime)}\`\n` +
          `➜ **Last Restarted:** <t:${d}:R>`
        )
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
