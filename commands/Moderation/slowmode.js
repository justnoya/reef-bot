const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'slowmode',
  aliases: ['slow', 'sm'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['ManageChannels', 'ViewChannel'],
  userPerms: ['ManageChannels'],
  description: 'Set slowmode for the current channel (0 to disable)',
  usage: ['slowmode <seconds>'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0) return err('Please provide a valid number of seconds (0 to disable).');
    if (seconds > 21600) return err('Maximum slowmode is **21600 seconds** (6 hours).');

    await message.channel.setRateLimitPerUser(seconds, `Set by ${message.author.tag}`);

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:moderation:1516337259157131365> Slowmode Updated`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          seconds === 0
            ? `➜ Slowmode has been **disabled** in <#${message.channel.id}>.`
            : `➜ Slowmode set to \`${seconds}s\` in <#${message.channel.id}>.\n➜ **Moderator:** <@${message.author.id}>`
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
