const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require(process.cwd() + "/schema/welcomer.js");

module.exports = {
  name: "w-setup",
  description: "Set up the welcome channel.",
  category: "welcome",
  cooldown: 5,
  userPerms: ["Administrator"],

  run: async (client, message, args, prefix) => {
    const color = '#FFFFFF';

    const channelA = message.mentions.channels.first();

    if (!channelA) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription("<:11:1052589045374533653> Please mention a text channel.")]
      });
    }

    if (!channelA.isTextBased()) {
      return message.reply({
        embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription("<:11:1052589045374533653> That's not a text channel.")]
      });
    }

    let data = await db.findOne({ guild: message.guild.id });

    if (!data) {
      data = new db({ guild: message.guild.id, enabled: "true", channel: channelA.id });
      await data.save();
    } else {
      await db.updateOne({ guild: message.guild.id }, { enabled: "true", channel: channelA.id });
    }

    return message.reply({
      embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription(`<:10:1052589041717092412> Welcomer is now enabled in <#${channelA.id}>.`)]
    });
  }
};
