const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');
const ms = require('ms');

module.exports = {
  name: 'tempban',
  aliases: ['tb'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['BanMembers', 'ViewChannel'],
  userPerms: ['BanMembers'],
  description: 'Temporarily ban a member for a set duration',
  usage: ['tempban @user <duration> [reason]'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return err('Please mention a member to tempban.');
    if (target.id === message.author.id) return err('You cannot tempban yourself.');
    if (!target.bannable) return err('I cannot ban this member.');
    if (message.member.roles.highest.position <= target.roles.highest.position && message.author.id !== message.guild.ownerId)
      return err('You cannot moderate a member with equal or higher roles.');

    const duration = ms(args[1]);
    if (!duration) return err('Provide a valid duration. Examples: `1h` `1d` `7d`');

    const reason = args.slice(2).join(' ') || 'No reason provided';
    const unbanAt = Date.now() + duration;
    const unbanTs = Math.round(unbanAt / 1000);

    try { await target.send(`🔨 You have been temporarily banned from **${message.guild.name}** for \`${args[1]}\`.\nReason: ${reason}`); } catch (_) {}
    await target.ban({ reason: `Tempban (${args[1]}): ${reason} | By ${message.author.tag}` });

    await client.db.set(`tempban_${message.guild.id}_${target.id}`, { unbanAt, guildId: message.guild.id, userId: target.id });
    setTimeout(async () => {
      try { await message.guild.bans.remove(target.id, 'Tempban expired'); } catch (_) {}
      await client.db.delete(`tempban_${message.guild.id}_${target.id}`);
    }, duration);

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:moderation:1516337259157131365> Member Temp-Banned`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **User:** \`${target.user.tag}\` \`${target.id}\`\n` +
          `➜ **Duration:** \`${args[1]}\`\n` +
          `➜ **Unbanned:** <t:${unbanTs}:R>\n` +
          `➜ **Reason:** ${reason}\n` +
          `➜ **Moderator:** <@${message.author.id}>`
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
