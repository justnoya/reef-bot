const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "unlock",
  description: "Unlock a channel.",
  category: "mod",
  cooldown: 5,
  userPerms: ["ManageChannels"],

  run: async (client, message, args, prefix) => {
    const color = '#FFFFFF';

    const botperm = message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)
      || message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator);
    const uperm = message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
      || message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!uperm) return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription("<:11:1052589045374533653> You don't have permission to use this command.")] });
    if (!botperm) return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription("<:11:1052589045374533653> I don't have permission to run this command.")] });

    const channel = message.mentions.channels.first() || message.channel;
    const reason = args.slice(1).join(" ") || "Not provided";

    if (!channel.isTextBased()) return message.reply({ embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription("<:11:1052589045374533653> That's not a text channel.")] });

    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: true
    }, { reason: `${reason} | ${message.author.tag} ${message.author.id}` });

    return message.reply({
      embeds: [new EmbedBuilder().setColor('#FFFFFF').setDescription(`<:10:1052589041717092412> <#${channel.id}> has been unlocked.`)]
    });
  }
};
