const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'role',
  aliases: ['addrole', 'removerole', 'giverole'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['ManageRoles', 'ViewChannel'],
  userPerms: ['ManageRoles'],
  description: 'Add or remove a role from a member',
  usage: ['role @user @role'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const target = message.mentions.members.first();
    if (!target) return err('Please mention a member.');
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) return err('Please mention a role or provide a role ID.');
    if (role.managed) return err('That role is managed by an integration and cannot be assigned manually.');
    if (role.position >= message.guild.members.me.roles.highest.position)
      return err('That role is higher than or equal to my highest role.');
    if (role.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId)
      return err('You cannot assign a role equal to or higher than your own.');

    const hasRole = target.roles.cache.has(role.id);
    if (hasRole) {
      await target.roles.remove(role, `Removed by ${message.author.tag}`);
    } else {
      await target.roles.add(role, `Added by ${message.author.tag}`);
    }

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:moderation:1516337259157131365> Role ${hasRole ? 'Removed' : 'Added'}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **User:** <@${target.id}>\n` +
          `➜ **Role:** <@&${role.id}>\n` +
          `➜ **Action:** ${hasRole ? '➖ Removed' : '➕ Added'}\n` +
          `➜ **Moderator:** <@${message.author.id}>`
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
