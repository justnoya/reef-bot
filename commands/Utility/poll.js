const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'poll',
  aliases: ['vote'],
  cooldown: 10,
  category: 'utility',
  botPerms: ['ViewChannel', 'AddReactions', 'EmbedLinks'],
  userPerms: ['ViewChannel'],
  description: 'Create a poll with up to 9 options, or a simple yes/no poll',
  usage: ['poll <question>', 'poll <question> | <option1> | <option2> | ...'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const input  = args.join(' ');

    const NUMBER_EMOJIS = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];

    if (input.includes('|')) {
      const parts = input.split('|').map(s => s.trim()).filter(Boolean);
      const question = parts[0];
      const options  = parts.slice(1);

      if (options.length < 2) {
        const c = new Container().setAccentColor('#ff0000')
          .addComponents(new TextDisplay('<:error:1425509196773720177> Please provide at least **2 options**.'));
        return message.channel.send({ components: [c.toJSON()], flags: IS_COMPONENTS_V2 });
      }
      if (options.length > 9) {
        const c = new Container().setAccentColor('#ff0000')
          .addComponents(new TextDisplay('<:error:1425509196773720177> Maximum **9 options** allowed.'));
        return message.channel.send({ components: [c.toJSON()], flags: IS_COMPONENTS_V2 });
      }

      const optionLines = options.map((o, i) => `${NUMBER_EMOJIS[i]} ${o}`).join('\n');
      const container = new Container()
        .setAccentColor(accent)
        .addComponents(
          new TextDisplay(`## 📊 ${question}`),
          new Separator().setDivider(true).setSpacing('Small'),
          new TextDisplay(optionLines),
          new Separator().setSpacing('Small'),
          new TextDisplay(`-# Poll by ${message.author.tag}`)
        );
      await message.delete().catch(() => {});
      const poll = await message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
      for (let i = 0; i < options.length; i++) await poll.react(NUMBER_EMOJIS[i]).catch(() => {});
    } else {
      const question = input;
      const container = new Container()
        .setAccentColor(accent)
        .addComponents(
          new TextDisplay(`## 📊 ${question}`),
          new Separator().setDivider(true).setSpacing('Small'),
          new TextDisplay('👍 Yes   •   👎 No'),
          new Separator().setSpacing('Small'),
          new TextDisplay(`-# Poll by ${message.author.tag}`)
        );
      await message.delete().catch(() => {});
      const poll = await message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
      await poll.react('👍');
      await poll.react('👎');
    }
  }
};
