const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'coinflip',
  aliases: ['flip', 'cf', 'coin'],
  cooldown: 3,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'Flip a coin — heads or tails',
  usage: ['coinflip', 'coinflip heads', 'coinflip tails'],
  run: async (client, message, args) => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji  = result === 'Heads' ? '🪙' : '🌕';
    const guess  = args[0]?.toLowerCase();
    let outcome  = '';

    if (guess === 'heads' || guess === 'tails') {
      const correct = guess === result.toLowerCase();
      outcome = correct
        ? `\n\n<:success:1425509054343675964> You guessed **${guess}** — you win!`
        : `\n\n<:error:1425509196773720177> You guessed **${guess}** — you lose!`;
    }

    const container = new Container()
      .setAccentColor('#FFFFFF')
      .addComponents(
        new TextDisplay(`## ${emoji} Coin Flip`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(`The coin landed on **${result}**!${outcome}`)
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
