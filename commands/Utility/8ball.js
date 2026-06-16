const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

const RESPONSES = [
  { text: 'It is certain.',            type: 'positive' },
  { text: 'It is decidedly so.',        type: 'positive' },
  { text: 'Without a doubt.',           type: 'positive' },
  { text: 'Yes, definitely.',           type: 'positive' },
  { text: 'You may rely on it.',         type: 'positive' },
  { text: 'As I see it, yes.',           type: 'positive' },
  { text: 'Most likely.',               type: 'positive' },
  { text: 'Outlook good.',              type: 'positive' },
  { text: 'Yes.',                        type: 'positive' },
  { text: 'Signs point to yes.',         type: 'positive' },
  { text: 'Reply hazy, try again.',      type: 'neutral'  },
  { text: 'Ask again later.',            type: 'neutral'  },
  { text: 'Better not tell you now.',    type: 'neutral'  },
  { text: 'Cannot predict now.',         type: 'neutral'  },
  { text: 'Concentrate and ask again.', type: 'neutral'  },
  { text: "Don't count on it.",          type: 'negative' },
  { text: 'My reply is no.',             type: 'negative' },
  { text: 'My sources say no.',          type: 'negative' },
  { text: 'Outlook not so good.',        type: 'negative' },
  { text: 'Very doubtful.',              type: 'negative' },
];

const COLOR = { positive: '#57F287', neutral: '#FEE75C', negative: '#ED4245' };
const EMOJI = { positive: '🎱', neutral: '🎱', negative: '🎱' };

module.exports = {
  name: '8ball',
  aliases: ['8b', 'ask'],
  cooldown: 3,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'Ask the magic 8-ball a yes/no question',
  usage: ['8ball <question>'],
  args: true,
  run: async (client, message, args) => {
    const question = args.join(' ');
    const res      = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

    const container = new Container()
      .setAccentColor(COLOR[res.type])
      .addComponents(
        new TextDisplay(`## 🎱 Magic 8-Ball`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(`**Question:** ${question}`),
        new Separator().setSpacing('Small'),
        new TextDisplay(`**Answer:** ${res.text}`)
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
