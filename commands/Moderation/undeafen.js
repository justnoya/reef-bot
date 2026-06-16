const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'undeafen',
  aliases: ['undeaf', 'udf'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['DeafenMembers', 'ViewChannel'],
  userPerms: ['DeafenMembers'],
  description: 'Remove server-deafen from a member in voice channel',
  usage: ['undeafen @user [reason]'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return err('Please mention a member.');
    if (!target.voice.channel) return err('That member is not in a voice channel.');
    if (!target.voice.serverDeaf) return err('That member is not server-deafened.');

    const reason = args.slice(1).join(' ') || 'No reason provided';
    await target.voice.setDeaf(false, `${reason} | By ${message.author.tag}`);

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:moderation:1516337259157131365> Member Undeafened`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **User:** <@${target.id}>\n` +
          `➜ **Channel:** <#${target.voice.channel.id}>\n` +
          `➜ **Reason:** ${reason}\n` +
          `➜ **Moderator:** <@${message.author.id}>`
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
