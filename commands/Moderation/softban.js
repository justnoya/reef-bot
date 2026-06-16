const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'softban',
  aliases: ['sb'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['BanMembers', 'ViewChannel'],
  userPerms: ['BanMembers'],
  description: 'Softban a member — bans and immediately unbans to delete their messages',
  usage: ['softban @user [reason]'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return err('Please mention a member to softban.');
    if (target.id === message.author.id) return err('You cannot softban yourself.');
    if (!target.bannable) return err('I cannot ban this member.');
    if (message.member.roles.highest.position <= target.roles.highest.position && message.author.id !== message.guild.ownerId)
      return err('You cannot moderate a member with equal or higher roles.');

    const reason = args.slice(1).join(' ') || 'No reason provided';
    try { await target.send(`🔨 You have been softbanned from **${message.guild.name}**.\nReason: ${reason}`); } catch (_) {}
    await target.ban({ deleteMessageSeconds: 7 * 24 * 60 * 60, reason: `Softban: ${reason} | By ${message.author.tag}` });
    await message.guild.bans.remove(target.id, 'Softban — auto unban');

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:moderation:1516337259157131365> Member Softbanned`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **User:** \`${target.user.tag}\` \`${target.id}\`\n` +
          `➜ **Action:** Banned + immediately unbanned (messages purged)\n` +
          `➜ **Reason:** ${reason}\n` +
          `➜ **Moderator:** <@${message.author.id}>`
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
