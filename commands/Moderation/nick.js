const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'nick',
  aliases: ['nickname', 'setnick'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['ManageNicknames', 'ViewChannel'],
  userPerms: ['ManageNicknames'],
  description: 'Set or reset a member\'s nickname',
  usage: ['nick @user <new nickname>', 'nick @user reset'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return err('Please mention a member.');
    if (!target.manageable) return err('I cannot manage this member\'s nickname.');
    if (target.id === message.guild.ownerId && message.author.id !== message.guild.ownerId)
      return err('I cannot change the server owner\'s nickname.');

    const newNick = args.slice(1).join(' ');
    const isReset = !newNick || newNick.toLowerCase() === 'reset';
    const oldNick = target.nickname || target.user.username;

    await target.setNickname(isReset ? null : newNick, `Set by ${message.author.tag}`);

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:moderation:1516337259157131365> Nickname ${isReset ? 'Reset' : 'Changed'}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **User:** <@${target.id}>\n` +
          `➜ **Before:** \`${oldNick}\`\n` +
          `➜ **After:** \`${isReset ? target.user.username : newNick}\`\n` +
          `➜ **Moderator:** <@${message.author.id}>`
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
