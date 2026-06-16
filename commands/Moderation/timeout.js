const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');
const ms = require('ms');

module.exports = {
  name: "timeout",
  aliases: ['to', 'mute'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['ModerateMembers', 'ViewChannel'],
  userPerms: ['ModerateMembers'],
  description: "Timeout a member for a set duration",
  usage: ['timeout @user <duration> [reason]'],
  args: true,
  run: async (client, message, args) => {
    const accent = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    const err = (text) => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`❌ ${text}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return err('Please mention a member to timeout.');

    const duration = ms(args[1]);
    if (!duration) return err('Provide a valid duration. Examples: `10m` `1h` `1d`');
    if (duration > ms('28d')) return err('Maximum timeout duration is 28 days.');
    if (!target.moderatable) return err('I cannot timeout this member.');
    if (target.id === message.author.id) return err('You cannot timeout yourself.');

    const reason = args.slice(2).join(' ') || 'No reason provided';
    await target.timeout(duration, reason);

    const until = Math.round((Date.now() + duration) / 1000);
    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:40:1052589138819436624> Member Timed Out`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **User:** <@${target.id}>\n` +
          `➜ **Duration:** \`${args[1]}\`\n` +
          `➜ **Expires:** <t:${until}:R>\n` +
          `➜ **Reason:** ${reason}\n` +
          `➜ **Moderator:** <@${message.author.id}>`
        )
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
