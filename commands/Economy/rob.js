const { EmbedBuilder } = require("discord.js");
const { PgCurrencySystem } = require("../../util/db");
const cs = new PgCurrencySystem();

module.exports = {
  name: "rob",
  description: "Rob another user's wallet!",
  category: 'economy',
  aliases: ['steal'],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = '#FFFFFF';

    const user = message.mentions.users.first();
    if (!user) return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription('Please mention a user to rob!')] });
    if (user.id === message.author.id) return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription("You can't rob yourself!")] });
    if (user.bot) return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription("You can't rob a bot!")] });

    const result = await cs.rob({
      user: message.author,
      user2: user,
      guild: { id: null },
      minAmount: 100,
      successPercentage: 50,
      cooldown: 25,
      maxRob: 1000
    });

    if (result.error) {
      if (result.type === "time") return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription(`You've already robbed recently. Try again in **${result.time}**`)] });
      if (result.type === "low-money") return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription(`You need at least **${result.minAmount}** coins in your wallet to rob someone.`)] });
      if (result.type === "low-wallet") return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription(`**${result.user2.username}** has less than **${result.minAmount}** coins — not worth it!`)] });
      if (result.type === "caught") return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription(`You got caught robbing **${result.user2.username}** and paid a fine of **${result.amount}** coins!`)] });
    }

    if (result.type === "success") {
      return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription(`You robbed **${result.user2.username}** and got away with <a:bitcoin:1055862360713220237> **${result.amount}** coins!`)] });
    }
  }
};
