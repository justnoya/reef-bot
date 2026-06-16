const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'unmute',
  aliases: ['untimeout', 'um'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['ModerateMembers', 'ViewChannel'],
  userPerms: ['ModerateMembers'],
  description: 'Unmute (remove timeout) a member',
  usage: ['unmute @user [reason]'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return err('Please mention a member to unmute.');
    if (!target.isCommunicationDisabled()) return err('That member is not currently muted.');
    if (!target.moderatable) return err('I cannot moderate this member.');

    const reason = args.slice(1).join(' ') || 'No reason provided';
    await target.timeout(null, `${reason} | By ${message.author.tag}`);

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:moderation:1516337259157131365> Member Unmuted`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **User:** <@${target.id}> \`${target.user.tag}\`\n` +
          `➜ **Reason:** ${reason}\n` +
          `➜ **Moderator:** <@${message.author.id}>`
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
    try { await target.send(`🔊 You have been unmuted in **${message.guild.name}**.\nReason: ${reason}`); } catch (_) {}
  }
};
