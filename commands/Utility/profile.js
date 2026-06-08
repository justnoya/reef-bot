const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
  name: "profile",
  category: "utility",
  description: "Show the user's profile and badges",
  args: false,
  aliases: ["badge", "badges", "achievement", "achievements"],
  usage: "[user]",
  owner: false,

  run: async (client, message, args) => {
    const color = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    let user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
    if (user.id === client.user.id) user = message.author;

    let voted = false;
    try { voted = await client.topgg.hasVoted(user.id); } catch (e) {}

    let uprem = await client.db.get(`uprem_${user.id}`);
    let upremend = await client.db.get(`upremend_${user.id}`);
    let count = await client.db.get(`upremcount_${user.id}`) || 0;

    let badges = "";

    if (client.config.owner.includes(user.id)) badges += `\n<:owner:979635607141756978> **Creator**`;

    try {
      const guildd = await client.guilds.fetch("805734218122264606");
      const sus = await guildd.members.fetch(user.id);

      if (sus.roles.cache.has("920657484585250827")) badges += `\n<:dev:978563383580295188> **Developer**`;
      if (sus.roles.cache.has("920657485298270209")) badges += `\n<:staff:984369673715982378> **Staff**`;
      if (sus.roles.cache.has("920657486409768961")) badges += `\n<:mod:984369659094654996> **Moderator**`;
      if (uprem || voted) badges += `\n<a:prime:1028203449977933854> **Premium User**`;
      if (sus.roles.cache.has("979644017807597568")) badges += `\n<:bug:984369647040204820> **Bug Hunter**`;
      if (sus.roles.cache.has("920657496182521856")) badges += `\n<:early:978563383479636019> **Supporter**`;
      if (sus.roles.cache.has("920657495427538974")) badges += `\n<:friends:984372535862919188> **Close Friend**`;
    } catch (err) {
      if (uprem || voted) badges += `\n<a:prime:1028203449977933854> **Premium User**`;
    }

    if (!badges.trim()) badges = "`No Badge Available`";

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Profile For ${user.username}`, iconURL: client.user.displayAvatarURL({ dynamic: true }), url: client.config.links.dc })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(color)
      .addFields({ name: '*__Achievements__*', value: badges })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};
