const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "noprefix",
  description: "Grant or revoke no-prefix access for a user [Owner only]",
  category: "Owner",
  aliases: ["np"],
  cooldown: 2,

  run: async (client, message, args, prefix) => {
    const color = '#FFFFFF';

    if (!client.config.owner.includes(message.author.id)) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor('#ff0000')
          .setDescription('<:11:1052589045374533653> Only bot owners can use this command.')]
      });
    }

    const target = message.mentions.users.first()
      || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null)
      || message.author;

    const stored = await client.db.get('noprefix_users') || [];

    const ownerIds = client.config.owner || [];
    const isOwner = ownerIds.includes(target.id);

    if (isOwner) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor('#FFFFFF')
          .setDescription(`<:10:1052589041717092412> **${target.username}** is a bot owner — they always have no-prefix access.`)]
      });
    }

    const hasNp = stored.includes(target.id);

    if (hasNp) {
      const updated = stored.filter(id => id !== target.id);
      await client.db.set('noprefix_users', updated);
      client.noprefix = [...ownerIds, ...updated];

      return message.reply({
        embeds: [new EmbedBuilder().setColor('#FFFFFF')
          .setDescription(`<:11:1052589045374533653> **No-prefix revoked** for <@${target.id}> (${target.username}).`)]
      });
    } else {
      const updated = [...stored, target.id];
      await client.db.set('noprefix_users', updated);
      client.noprefix = [...ownerIds, ...updated];

      return message.reply({
        embeds: [new EmbedBuilder().setColor('#FFFFFF')
          .setDescription(`<:10:1052589041717092412> **No-prefix granted** to <@${target.id}> (${target.username}).\nThey can now use all commands without a prefix.`)]
      });
    }
  }
};
