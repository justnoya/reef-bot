const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "ban",
  description: "Ban a member.",
  category: "mod",
  cooldown: 5,
  userPerms: ["BanMembers"],

  run: async (client, message, args, prefix) => {
    const color = message.guild.members.me.displayHexColor !== "#000000"
      ? message.guild.members.me.displayHexColor
      : client.config.embedColor;

    const botperm = message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)
      || message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator);
    const uperm = message.member.permissions.has(PermissionsBitField.Flags.BanMembers)
      || message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!uperm) return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("You don't have permission to use this command.")] });
    if (!botperm) return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("I don't have permission to run this command.")] });

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(" ") || "Not provided";

    if (!member) return message.reply("Member not found.");
    if (member.id === message.author.id) return message.reply({ content: "You can't ban yourself." });
    if (message.member.roles.highest.position <= member.roles.highest.position && message.author.id !== message.guild.ownerId)
      return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("<:11:1052589045374533653> You don't have permission to moderate that member.")] });
    if (!member.bannable)
      return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("<:11:1052589045374533653> I don't have permissions to moderate that member.")] });

    await member.ban({ reason: `${reason} | ${message.author.tag} ${message.author.id}` });
    return message.reply({
      embeds: [new EmbedBuilder().setColor(color).setDescription(`<:10:1052589041717092412> \`${member.user.tag}\` has been banned.`)]
    });
  }
};
