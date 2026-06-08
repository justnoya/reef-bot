const { EmbedBuilder } = require("discord.js");
const { PgCurrencySystem } = require("../../util/db");
const cs = new PgCurrencySystem();

module.exports = {
  name: "leaderboard",
  description: "Show the global economy leaderboard",
  category: 'economy',
  aliases: ['lb'],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    const data = await cs.globalLeaderboard();

    if (!data || data.length < 1) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor(color).setDescription("Nobody's on the leaderboard yet.")]
      });
    }

    const msg = new EmbedBuilder().setColor(color).setTitle('🏆 Global Leaderboard');
    const fields = [];
    let pos = 0;

    for (const e of data.slice(0, 10)) {
      const cachedUser = client.users.cache.get(e.userID);
      if (!cachedUser) continue;
      pos++;
      fields.push({
        name: `${pos} • **${cachedUser.username}**`,
        value: `<a:wallet:1055761007789748275> Wallet: <a:bitcoin:1055862360713220237>**${e.wallet}** • <:ecobank:1055873821590175784> Bank: <a:bitcoin:1055862360713220237>**${e.bank}**`,
        inline: false
      });
    }

    if (!fields.length) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("Nobody's in the leaderboard yet.")] });
    }

    msg.addFields(fields);
    return message.reply({ embeds: [msg] }).catch(() => {});
  }
};
