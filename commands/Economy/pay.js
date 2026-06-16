const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');
const { query } = require('../../util/db');

module.exports = {
  name: "pay",
  aliases: ['give', 'transfer'],
  cooldown: 10,
  category: 'economy',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: "Transfer coins from your wallet to another user",
  usage: ['pay @user <amount>'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';

    const err = (text) => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`❌ ${text}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const target = message.mentions.users.first();
    if (!target) return err('Please mention a user to pay.');
    if (target.id === message.author.id) return err('You cannot pay yourself.');
    if (target.bot) return err('You cannot pay a bot.');

    const amount = parseInt(args[1]);
    if (!amount || isNaN(amount) || amount < 1) return err('Provide a valid amount (minimum 1).');

    const senderRes = await query('SELECT wallet FROM users WHERE user_id = $1', [message.author.id]);
    const senderWallet = senderRes.rows[0]?.wallet || 0;
    if (senderWallet < amount) return err(`You only have \`${senderWallet}\` coins in your wallet.`);

    await query('INSERT INTO users (user_id, wallet) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET wallet = users.wallet - $2 WHERE users.user_id = $1', [message.author.id, amount]);
    await query('INSERT INTO users (user_id, wallet) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET wallet = users.wallet + $2 WHERE users.user_id = $1', [target.id, amount]);

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <a:bitcoin:1055862360713220237> Transfer Complete`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **From:** <@${message.author.id}>\n` +
          `➜ **To:** <@${target.id}>\n` +
          `➜ **Amount:** \`${amount}\` coins\n` +
          `➜ **Your New Balance:** \`${senderWallet - amount}\` coins`
        )
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
