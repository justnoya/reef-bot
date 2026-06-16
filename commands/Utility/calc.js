const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'calc',
  aliases: ['calculate', 'math'],
  cooldown: 3,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'Evaluate a mathematical expression',
  usage: ['calc <expression>'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const expr   = args.join(' ').replace(/[^0-9+\-*/%.()^ ]/g, '');

    if (!expr.trim()) {
      const c = new Container().setAccentColor('#ff0000')
        .addComponents(new TextDisplay('<:error:1425509196773720177> Invalid expression. Only numbers and `+ - * / % ( )` are allowed.'));
      return message.channel.send({ components: [c.toJSON()], flags: IS_COMPONENTS_V2 });
    }

    let result;
    try {
      // Safe eval using Function constructor (expression-only, no statements)
      result = Function('"use strict"; return (' + expr + ')')();
      if (!isFinite(result)) throw new Error('Result is not finite');
    } catch {
      const c = new Container().setAccentColor('#ff0000')
        .addComponents(new TextDisplay('<:error:1425509196773720177> Could not evaluate that expression.'));
      return message.channel.send({ components: [c.toJSON()], flags: IS_COMPONENTS_V2 });
    }

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## 🧮 Calculator`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **Expression:** \`${args.join(' ')}\`\n` +
          `➜ **Result:** \`${result}\``
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
