const { EmbedBuilder } = require("discord.js");
const { PgCurrencySystem } = require("../../util/db");
const cs = new PgCurrencySystem();

module.exports = {
  name: "daily",
  description: "Claim your daily reward!",
  category: 'economy',
  aliases: ['daily'],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    const result = await cs.daily({
      user: message.author,
      guild: { id: null },
      amount: 100
    });

    if (result.error) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor(color)
          .setDescription(`<:11:1052589045374533653> You've claimed your daily recently.\n\nTry again in **${result.time}**`)]
      });
    }

    return message.reply({
      embeds: [new EmbedBuilder().setColor(color)
        .setDescription(`You earned <a:bitcoin:1055862360713220237> **${result.amount}** coins!\n\nYour daily streak is now **${result.rawData.streak.daily}** days 🔥`)]
    });
  }
};
