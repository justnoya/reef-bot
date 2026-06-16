const { EmbedBuilder, WebhookClient } = require('discord.js');
const { Webhooks: { server_add } } = require('../config.json');

module.exports.run = async (client, guild) => {
  try {
    let emoji = "";
    const own = await guild.fetchOwner().catch(() => null);

    // Sum member counts without blocking the event loop on large bot counts
    let mcount = 0;
    client.guilds.cache.forEach(g => { mcount += g.memberCount; });

    if (guild.partnered && guild.verified)       emoji = "<:partnered:918906133563998230><:verified3:918906111359340594>";
    else if (guild.partnered && !guild.verified) emoji = "<:partnered:918906133563998230>";
    else if (!guild.partnered && guild.verified) emoji = "<:verified3:918906111359340594>";
    else                                         emoji = "<:cross1:853965073383292970>";

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .setColor('#FFFFFF')
      .setDescription(
        `**ID:** ${guild.id}\n` +
        `**Name:** ${guild.name}\n` +
        `**Level:** ${emoji}\n` +
        `**Members:** \`${guild.memberCount}\`\n` +
        `**Created:** <t:${Math.round(guild.createdTimestamp / 1000)}:R>\n` +
        `**Joined:** <t:${Math.round(guild.joinedTimestamp / 1000)}:R>`
      )
      .addFields(
        {
          name: "Owner",
          value: own
            ? `**${own.user.tag}** (${own.id})\nCreated <t:${Math.round(own.user.createdTimestamp / 1000)}:R>`
            : "Unknown",
        },
        { name: `${client.user.username}'s Servers`, value: `\`\`\`js\n${client.guilds.cache.size}\`\`\``, inline: true },
        { name: `${client.user.username}'s Users`,   value: `\`\`\`js\n${mcount}\`\`\``,                  inline: true }
      );

    if (guild.vanityURLCode) embed.setURL(`https://discord.gg/${guild.vanityURLCode}`);
    if (guild.banner) {
      embed.setImage(`https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.webp?size=1024`);
    }

    if (server_add && server_add !== "WEBHOOK") {
      const web = new WebhookClient({ url: server_add });
      web.send({ content: "**✅ Server Joined**", embeds: [embed] }).catch(() => {});
    }
  } catch (err) {
    console.error("[guildCreate]", err);
  }
};
