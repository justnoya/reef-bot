const { Container, TextDisplay, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: "clearwarns",
  aliases: ['cw', 'clearwarn'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['ViewChannel'],
  userPerms: ['ModerateMembers'],
  description: "Clear all warnings for a member",
  usage: ['clearwarns @user'],
  args: true,
  run: async (client, message, args) => {
    const accent = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    const target = message.mentions.users.first() || client.users.cache.get(args[0]);
    if (!target) return message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay('❌ Please mention a member.')).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    await client.db.delete(`warns_${message.guild.id}_${target.id}`);

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(new TextDisplay(`✅ Cleared all warnings for <@${target.id}>.`));
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
