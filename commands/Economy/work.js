const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');
const { query } = require('../../util/db');

const JOBS = [
  'Software Engineer', 'Doctor', 'Chef', 'Artist', 'Teacher',
  'Driver', 'Mechanic', 'Lawyer', 'Musician', 'Architect'
];

const COOLDOWN_MS = 3600000; // 1 hour

module.exports = {
  name: "work",
  aliases: ['wrk'],
  cooldown: 3,
  category: 'economy',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: "Work to earn coins (1 hour cooldown)",
  usage: ['work'],
  run: async (client, message) => {
    const accent = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    const cdKey = `workcd_${message.author.id}`;
    const lastWork = await client.db.get(cdKey) || 0;
    const now = Date.now();
    const diff = now - lastWork;

    if (diff < COOLDOWN_MS) {
      const remaining = COOLDOWN_MS - diff;
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      const container = new Container()
        .setAccentColor('#ff0000')
        .addComponents(new TextDisplay(`❌ You already worked recently. Try again in \`${mins}m ${secs}s\`.`));
      return message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
    }

    const amount = Math.floor(Math.random() * 401) + 100; // 100–500
    const job    = JOBS[Math.floor(Math.random() * JOBS.length)];

    await client.db.set(cdKey, now);
    await query(
      'INSERT INTO users (user_id, wallet) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET wallet = users.wallet + $2 WHERE users.user_id = $1',
      [message.author.id, amount]
    );

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <a:bitcoin:1055862360713220237> Paycheck`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `You worked as a **${job}** and earned \`${amount}\` coins!\n\n` +
          `*Come back in \`1 hour\` to work again.*`
        )
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
