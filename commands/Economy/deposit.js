const { EmbedBuilder } = require("discord.js");
const User = require("../../Models/User.js");

module.exports = {
  name: "deposit",
  description: "Deposit coins into your bank.",
  category: "economy",
  aliases: ["dep"],
  cooldown: 2,

  run: async (client, message, args, prefix) => {
    const color = '#FFFFFF';

    const user   = message.author;
    const amount = parseInt(args[0]);

    const result = (await User.findOne({ userId: user.id })) || new User({ userId: user.id });

    if (!amount || isNaN(amount) || amount < 1)
      return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription("<:11:1052589045374533653> Enter a valid amount.")] });

    if (result.wallet < amount)
      return message.reply({
        embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription(`💰 You need \`${amount - result.wallet} 🪙\` more in your wallet.`)]
      });

    result.wallet -= amount;
    result.bank   += amount;
    await result.save();

    return message.reply({
      embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription(`✅ You deposited \`${amount} 🪙\` into your bank.`)]
    });
  },
};
