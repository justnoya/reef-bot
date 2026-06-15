const { EmbedBuilder, WebhookClient } = require('discord.js');
const { Webhooks: { server_remove } } = require('../config.json');

module.exports.run = async (client, guild) => {
  try {
    // Clean up any active VC locks for this guild
    if (client.vcLocks && client.vcLocks.size > 0) {
      for (const [channelId, lockData] of client.vcLocks.entries()) {
        if (lockData.guildId === guild.id) {
          try { lockData.connection.destroy(); } catch (_) {}
          client.vcLocks.delete(channelId);
        }
      }
    }

    // Clean up prefix cache entry
    const p = await client.db.get(`prefix_${guild.id}`);
    if (p) await client.db.delete(`prefix_${guild.id}`);

    let mcount = 0;
    client.guilds.cache.forEach(g => { mcount += g.memberCount; });

    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setDescription(
        `**ID:** ${guild.id}\n` +
        `**Name:** ${guild.name}\n` +
        `**Members:** \`${guild.memberCount}\`\n` +
        `**Created:** <t:${Math.round(guild.createdTimestamp / 1000)}:R>\n` +
        `**Left:** <t:${Math.round(Date.now() / 1000)}:R>`
      )
      .addFields(
        { name: `${client.user.username}'s Servers`, value: `\`\`\`js\n${client.guilds.cache.size}\`\`\``, inline: true },
        { name: `${client.user.username}'s Users`,   value: `\`\`\`js\n${mcount}\`\`\``,                  inline: true }
      );

    if (guild.available) {
      embed.setTitle(guild.name);
      if (guild.iconURL()) embed.setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }));
      if (guild.vanityURLCode) embed.setURL(`https://discord.gg/${guild.vanityURLCode}`);
      if (guild.banner) embed.setImage(`https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.webp?size=1024`);
    }

    if (server_remove && server_remove !== "WEBHOOK") {
      const web = new WebhookClient({ url: server_remove });
      web.send({ content: "**❌ Server Left**", embeds: [embed] }).catch(() => {});
    }
  } catch (err) {
    console.error("[guildDelete]", err);
  }
};
