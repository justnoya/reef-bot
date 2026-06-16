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
  name: "shop",
  description: "Browse the item shop",
  category: 'economy',
  aliases: ['store'],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = '#FFFFFF';

    const result = await cs.getShopItems({ guild: { id: null } });
    const inv = result.inventory;

    const embed = new EmbedBuilder().setColor('#FFFFFF').setTitle('<:store:1055863295757783132> Shop');

    if (!inv.length) {
      embed.setDescription('The shop is empty! Ask an owner to add items using `/additem`.');
      return message.reply({ embeds: [embed] });
    }

    const fields = inv.map((item, idx) => {
      const emoji = ITEM_EMOJIS[item.name] || '🛒';
      return {
        name: `${idx + 1} - ${emoji} **${item.name}:** <a:bitcoin:1055862360713220237>${item.price}`,
        value: `Description: ${item.description}`
      };
    });

    embed.addFields(fields);
    return message.reply({ embeds: [embed] });
  }
};
