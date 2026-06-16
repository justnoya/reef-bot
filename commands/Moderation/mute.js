const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');
const ms = require('ms');

module.exports = {
  name: 'mute',
  aliases: ['timeout', 'to', 'tm'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['ModerateMembers', 'ViewChannel'],
  userPerms: ['ModerateMembers'],
  description: 'Mute (timeout) a member for a set duration',
  usage: ['mute @user <duration> [reason]'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return err('Please mention a member to mute.');
    if (target.id === message.author.id) return err('You cannot mute yourself.');
    if (!target.moderatable) return err('I cannot moderate this member.');
    if (message.member.roles.highest.position <= target.roles.highest.position && message.author.id !== message.guild.ownerId)
      return err('You cannot moderate a member with equal or higher roles.');

    const duration = ms(args[1]);
    if (!duration) return err('Provide a valid duration. Examples: `10m` `1h` `2d`');
    if (duration > ms('28d')) return err('Maximum mute duration is **28 days**.');

    const reason = args.slice(2).join(' ') || 'No reason provided';
    await target.timeout(duration, `${reason} | By ${message.author.tag}`);

    const until = Math.round((Date.now() + duration) / 1000);
    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:moderation:1516337259157131365> Member Muted`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **User:** <@${target.id}> \`${target.user.tag}\`\n` +
          `➜ **Duration:** \`${args[1]}\`\n` +
          `➜ **Unmuted:** <t:${until}:R>\n` +
          `➜ **Reason:** ${reason}\n` +
          `➜ **Moderator:** <@${message.author.id}>`
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
    try { await target.send(`🔇 You have been muted in **${message.guild.name}** for \`${args[1]}\`.\nReason: ${reason}`); } catch (_) {}
  }
};
