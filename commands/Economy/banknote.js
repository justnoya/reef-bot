const { EmbedBuilder } = require("discord.js");
const { PgCurrencySystem } = require("../../util/db");
const cs = new PgCurrencySystem();

module.exports = {
  name: "banknote",
  description: "Use banknotes to increase your bank space",
  usage: "banknote [amount]",
  category: 'economy',
  aliases: ['usenote'],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    const errus = new EmbedBuilder().setColor(color).setTitle('An Error Occurred!');

    const arr = await cs.getUserItems({ user: message.author, guild: { id: null } });
    if (!arr.inventory.length) {
      return message.reply({ embeds: [errus.setDescription("<:11:1052589045374533653> You don't have any Banknotes! Please buy some from the shop.")] });
    }

    const noteIndex = arr.inventory.findIndex(i => i.name.toLowerCase().includes('bank note'));
    if (noteIndex === -1) {
      return message.reply({ embeds: [errus.setDescription("<:11:1052589045374533653> You don't have any Banknotes! Please buy some from the shop.")] });
    }

    const useAmount = parseInt(args[0]) || 1;
    const removeItem = await cs.removeUserItem({
      user: message.author,
      item: noteIndex + 1,
      guild: { id: null },
      amount: useAmount
    });

    if (removeItem.error) {
      return message.reply({ embeds: [errus.setDescription("<:11:1052589045374533653> Unknown error occurred. Please contact support.")] });
    }

    const newSpace = 5000 * useAmount + removeItem.rawData.bankSpace;
    const result = await cs.setBankSpace(message.author.id, null, newSpace);

    if (!result.error) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor(color)
          .setDescription(`<:10:1052589041717092412> Successfully updated bank space!\n<:ecobank:1055873821590175784> Current bank space: **${result.amount}**`)]
      });
    }
    return message.reply({ embeds: [errus.setDescription(`<:11:1052589045374533653> ${result.error}`)] });
  }
};
