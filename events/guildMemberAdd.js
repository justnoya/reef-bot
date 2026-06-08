const { EmbedBuilder } = require("discord.js");
const db = require(process.cwd() + '/schema/welcomer.js');

module.exports = {
  name: "guildMemberAdd",
  run: async (client, member) => {
    try {
      const guild = member.guild;
      const data = await db.findOne({ guild: guild.id });
      if (!data) return;
      if (data.enabled === 'false') return;

      const channel = guild.channels.cache.get(data.channel);
      if (!channel) return;

      const content = data.message
        .replaceAll('<<user.name>>', member.user.username)
        .replaceAll('<<user.id>>', member.user.id)
        .replaceAll('<<user.tag>>', member.user.tag)
        .replaceAll('<<guild.mc>>', guild.memberCount)
        .replaceAll('<<guild.name>>', guild.name)
        .replaceAll('<<user.mention>>', `<@${member.user.id}>`);

      const botMember = guild.members.me;
      const color = botMember?.displayHexColor !== '#000000' ? botMember?.displayHexColor : client.config.embedColor;

      const embed = new EmbedBuilder()
        .setAuthor({
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL(),
          url: `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`
        })
        .setColor(color)
        .setDescription(content)
        .setTimestamp();

      channel.send({ embeds: [embed] }).catch(() => {});
    } catch (err) {
      console.error('[guildMemberAdd]', err);
    }
  }
};
