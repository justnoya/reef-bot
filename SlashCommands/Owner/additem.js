const { EmbedBuilder } = require("discord.js");
const { PgCurrencySystem } = require("../../util/db");
const cs = new PgCurrencySystem();

module.exports = {
  name: "additem",
  description: "Add an item to the shop [Owner Only]",
  cooldown: 5,
  owner: true,
  botPerms: ['ViewChannel', 'EmbedLinks', 'UseExternalEmojis'],
  userPerms: ['ViewChannel'],
  options: [
    { name: 'name', type: 3, description: 'Name of the item', required: true },
    { name: 'price', type: 4, description: 'Price of the item', required: true },
    { name: 'description', type: 3, description: 'Description of the item', required: false }
  ],

  run: async (client, interaction) => {
    await interaction.deferReply();

    if (!client.config.owner.includes(interaction.user.id)) {
      return interaction.editReply('Only bot owners can use this command.');
    }

    const price = interaction.options.getInteger('price');
    if (price < 1) return interaction.editReply("You can't add an item for less than 1 coin!");

    const result = await cs.addItem({
      guild: { id: null },
      inventory: {
        name: interaction.options.getString('name'),
        price,
        description: interaction.options.getString('description') || 'No Description'
      }
    });

    if (result.error) {
      const msgs = {
        'No-Inventory-Name': 'Please enter an item name.',
        'Invalid-Inventory-Price': 'Invalid price provided.',
        'No-Inventory-Price': 'Please specify a price.',
        'No-Inventory': 'No data received.'
      };
      return interaction.editReply(msgs[result.type] || 'An error occurred.');
    }

    return interaction.editReply(`Done! Successfully added \`${interaction.options.getString('name')}\` to the shop!`);
  }
};
