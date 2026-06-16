const { EmbedBuilder } = require("discord.js");
const { PgCurrencySystem } = require("../../util/db");
const cs = new PgCurrencySystem();

const ITEM_EMOJIS = {
  'Laptop': '<:laptop:1055862662380142684>',
  'Rolex': '<:rolex:1056942672385953933>',
  'Bank Note': '<:Banknote2:1056943624874639392>',
  'Iphone': '<:iphone12max:1056942815646580798>',
  'Chill Pill': '<:chillpill:1057202298910158879>',
  'Garbage': '<:garbage:1057202722971070474>',
  'Fake Id': '<:fakeid:1057202440811855953>',
  'Rifle': '<:rifle:1057202795196973079>',
  'Junk': '<:junk:1057202655551832105>',
  'Landmine': '<:landmine:1057202882887299172>'
};

module.exports = {
  name: "buy",
  description: "Buy an item from the shop",
  category: 'economy',
  usage: "buy <item_number> [amount]",
  aliases: ['purchase'],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = '#FFFFFF';

    const embed = new EmbedBuilder().setColor('#FFFFFF');
    const itemNum = parseInt(args[0]);
    const amount = parseInt(args[1]) || 1;

    if (!args[0] || isNaN(itemNum)) {
      return message.reply({ embeds: [embed.setDescription('<:11:1052589045374533653> Provide a valid item number')] });
    }

    const result = await cs.buy({
      user: message.author,
      guild: { id: null },
      item: itemNum,
      amount
    });

    if (result.error) {
      const msgs = {
        'No-Item': '<:11:1052589045374533653> Please provide a valid item number.',
        'Invalid-Item': '<:11:1052589045374533653> That item does not exist.',
        'low-money': '<:11:1052589045374533653> You don\'t have enough coins in your wallet.',
        'Invalid-Amount': '<:11:1052589045374533653> Amount must be at least 1.'
      };
      return message.reply({ embeds: [embed.setDescription(msgs[result.type] || 'An error occurred.')] });
    }

    const emoji = ITEM_EMOJIS[result.inventory.name] || '🛒';
    return message.reply({
      embeds: [embed.setDescription(`<:10:1052589041717092412> Successfully bought **${amount}x ${emoji} ${result.inventory.name}** for <a:bitcoin:1055862360713220237> **${result.price}** coins`)]
    });
  }
};
