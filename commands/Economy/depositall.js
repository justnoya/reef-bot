const { EmbedBuilder } = require("discord.js");
const { PgCurrencySystem } = require("../../util/db");
const cs = new PgCurrencySystem();

module.exports = {
  name: "depositall",
  description: "Deposit all wallet coins to bank",
  category: 'economy',
  aliases: ['depmax', 'depall'],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    const user = message.author;
    const bal = await cs.balance({ user, guild: { id: null } });

    if (bal.wallet === 0) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("<:11:1052589045374533653> You don't have any money in your wallet.")] });
    }

    const result = await cs.deposite({ user, guild: { id: null }, amount: bal.wallet });

    if (result.error) {
      const msgs = {
        'money': '<:11:1052589045374533653> No amount to deposit.',
        'negative-money': "<:11:1052589045374533653> You can't deposit negative money.",
        'low-money': "<:11:1052589045374533653> You don't have that much in your wallet.",
        'no-money': "<:11:1052589045374533653> You don't have money in your wallet.",
        'bank-full': "<:11:1052589045374533653> Your bank is full. Use banknotes to expand it."
      };
      return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(msgs[result.type] || 'Error.')] });
    }

    return message.reply({
      embeds: [new EmbedBuilder().setColor(color)
        .setDescription(`Deposited all <a:bitcoin:1055862360713220237>**${result.amount}** to bank.\n\n**Updated Balance:**\n<a:wallet:1055761007789748275> Wallet: <a:bitcoin:1055862360713220237>${result.rawData.wallet}\n<:ecobank:1055873821590175784> Bank: <a:bitcoin:1055862360713220237>${result.rawData.bank}`)]
    });
  }
};
