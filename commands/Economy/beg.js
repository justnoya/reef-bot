const { EmbedBuilder } = require("discord.js");
const { PgCurrencySystem } = require("../../util/db");
const cs = new PgCurrencySystem();

module.exports = {
  name: "beg",
  description: "Beg to earn some money!",
  category: 'economy',
  aliases: ['beg'],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = '#FFFFFF';

    const result = await cs.beg({
      user: message.author,
      guild: { id: null },
      minAmount: 20,
      maxAmount: 100,
      cooldown: 100
    });

    if (result.error) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor('#FFFFFF')
          .setDescription(`You have begged recently. Try again in **${result.time}**`)]
      });
    }

    return message.reply({
      embeds: [new EmbedBuilder().setColor('#FFFFFF')
        .setDescription(`You have earned <a:bitcoin:1055862360713220237> **${result.amount}** coins.`)]
    });
  }
};
