const { EmbedBuilder } = require("discord.js");
const { PgCurrencySystem } = require("../../util/db");
const cs = new PgCurrencySystem();

module.exports = {
  name: "withdrawall",
  description: "Withdraw all coins from bank",
  category: 'economy',
  aliases: ['withall', 'waall'],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = '#FFFFFF';

    const user = message.author;
    const bal = await cs.balance({ user, guild: { id: null } });

    if (bal.bank === 0) {
      return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription("<:11:1052589045374533653> You don't have any money in your bank.")] });
    }

    const result = await cs.withdraw({ user, guild: { id: null }, amount: bal.bank });

    if (result.error) {
      const msgs = {
        'money': '<:11:1052589045374533653> No amount specified.',
        'negative-money': "<:11:1052589045374533653> You can't withdraw negative money.",
        'low-money': "<:11:1052589045374533653> You don't have that much in your bank.",
        'no-money': "<:11:1052589045374533653> You don't have money in your bank."
      };
      return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription(msgs[result.type] || 'Error.')] });
    }

    return message.reply({
      embeds: [new EmbedBuilder().setColor('#FFFFFF')
        .setDescription(`Withdrew all <a:bitcoin:1055862360713220237>**${result.amount}** from bank.\n\n**Updated Balance:**\n<a:wallet:1055761007789748275> Wallet: <a:bitcoin:1055862360713220237>${result.rawData.wallet}\n<:ecobank:1055873821590175784> Bank: <a:bitcoin:1055862360713220237>${result.rawData.bank}`)]
    });
  }
};
