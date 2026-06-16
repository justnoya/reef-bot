const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');
const ms = require('ms');

module.exports = {
  name: 'remind',
  aliases: ['remindme', 'reminder', 'rm'],
  cooldown: 5,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'Set a reminder for yourself',
  usage: ['remind <duration> <message>', 'remind 1h Check the oven'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const duration = ms(args[0]);
    if (!duration) return err('Please provide a valid duration first. Examples: `30m` `2h` `1d`');
    if (duration > ms('30d')) return err('Maximum reminder duration is **30 days**.');

    const reminder = args.slice(1).join(' ');
    if (!reminder) return err('Please provide a reminder message after the duration.');

    const fireAt = Math.round((Date.now() + duration) / 1000);

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## ⏰ Reminder Set`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `<@${message.author.id}> I'll remind you <t:${fireAt}:R>.\n\n` +
          `➜ **Reminder:** ${reminder}\n` +
          `➜ **Fires at:** <t:${fireAt}:F>`
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });

    setTimeout(async () => {
      const fire = new Container()
        .setAccentColor('#57F287')
        .addComponents(
          new TextDisplay(`## ⏰ Reminder!`),
          new Separator().setDivider(true).setSpacing('Small'),
          new TextDisplay(`<@${message.author.id}> You asked me to remind you:\n\n➜ ${reminder}`)
        );
      message.channel.send({ components: [fire.toJSON()], flags: IS_COMPONENTS_V2 }).catch(() => {});
    }, duration);
  }
};
