const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "lock",
  description: "Lock a channel.",
  category: "mod",
  cooldown: 5,
  userPerms: ["ManageChannels"],

  run: async (client, message, args, prefix) => {
    const color = message.guild.members.me.displayHexColor !== "#000000"
      ? message.guild.members.me.displayHexColor
      : client.config.embedColor;

    const botperm = message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)
      || message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator);
    const uperm = message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
      || message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!uperm) return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("You don't have permission to use this command.")] });
    if (!botperm) return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("I don't have permission to run this command.")] });

    const channel = message.mentions.channels.first() || message.channel;
    const reason = args.slice(1).join(" ") || "Not provided";

    if (!channel.isTextBased()) return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("That's not a text channel.")] });

    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      SendMessages: false
    }, { reason: `${reason} | ${message.author.tag} ${message.author.id}` });

    return message.reply({
      embeds: [new EmbedBuilder().setColor(color).setDescription(`<#${channel.id}> has been locked.`)]
    });
  }
};
