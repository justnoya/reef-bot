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
  name: "inventory",
  description: "View your inventory",
  category: 'economy',
  aliases: ['invent', 'inv'],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = '#FFFFFF';

    const user = message.mentions.users.first() || message.author;
    const result = await cs.getUserItems({ user, guild: { id: null } });
    const inv = result.inventory.slice(0, 10);

    const embed = new EmbedBuilder().setColor('#FFFFFF');

    if (!inv.length) {
      embed.setDescription('<:backpack:1056172618379694090> Your inventory is empty.');
      return message.reply({ embeds: [embed] });
    }

    embed.setDescription('<:backpack:1056172618379694090> **Your Inventory**');

    const fields = inv.map(item => {
      const emoji = ITEM_EMOJIS[item.name] || '🎒';
      return {
        name: `**${emoji} ${item.name}**`,
        value: `Amount: <a:bitcoin:1055862360713220237> ${item.amount}`
      };
    });

    embed.addFields(fields);
    return message.reply({ embeds: [embed] });
  }
};
