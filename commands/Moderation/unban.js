const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "unban",
  description: "Unban a user.",
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

    if (!uperm) return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("<:11:1052589045374533653> You don't have permission to use this command.")] });
    if (!botperm) return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("<:11:1052589045374533653> I don't have permission to run this command.")] });

    const userid = args[0];
    const reason = args.slice(1).join(" ") || "Not provided";

    if (!userid) return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("<:11:1052589045374533653> Please provide a user ID to unban.")] });

    const user = await client.users.fetch(userid).catch(() => null);
    if (!user) return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription("<:11:1052589045374533653> No user found with that ID.")] });

    await message.guild.bans.remove(user, `${reason} | ${message.author.tag} ${message.author.id}`).catch(() => null);

    return message.reply({
      embeds: [new EmbedBuilder().setColor(color).setDescription(`<:10:1052589041717092412> \`${user.tag}\` has been unbanned.`)]
    });
  }
};
