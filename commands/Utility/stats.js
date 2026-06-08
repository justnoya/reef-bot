const { EmbedBuilder } = require('discord.js');
const { mem } = require('node-os-utils');
const packageJSON = require("../../package.json");
const User = require("../../Models/User");
const discordJSVersion = packageJSON.dependencies["discord.js"];
const os = require('os');

module.exports = {
  name: "stats",
  category: 'info',
  cooldown: 5,
  botPerms: ['ViewChannel', 'EmbedLinks', 'UseExternalEmojis'],
  userPerms: ['ViewChannel'],
  description: "Stats of the bot",
  aliases: ['stats', 'bi', 'botinfo'],
  run: async (client, message, args) => {
    let connectedchannelsamount = 0;
    const guilds = client.guilds.cache.map(g => g);
    for (const guild of guilds) {
      if (guild.members.me.voice.channel) connectedchannelsamount++;
    }
    if (connectedchannelsamount > client.guilds.cache.size)
      connectedchannelsamount = client.guilds.cache.size;

    let data = await User.findOne({ userId: message.author.id });
    if (!data) data = await User.create({ userId: message.author.id });

    const { totalMemMb, usedMemMb } = await mem.info();

    let users = 0;
    client.guilds.cache.forEach(g => { users += g.memberCount; });

    const duration1  = Math.round((Date.now() - message.client.uptime) / 1000);
    const inviteURL  = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`;
    const supportURL = client.config.links.dc;

    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setAuthor({ name: `${client.user.username} — Bot Information`, iconURL: client.user.displayAvatarURL(), url: supportURL })
      .setDescription(`Hey ${message.author.username}! I'm **${client.user.username}**, a multi-purpose Discord bot built for communities.`)
      .addFields(
        {
          name: `<:stats:985100769520930816> Statistics`,
          value: `➜ **${client.guilds.cache.size}** Servers\n➜ **${users}** Users\n➜ **${client.channels.cache.size}** Channels`,
        },
        {
          name: `Commands Used By You`,
          value: `${data.count} message commands`,
          inline: true,
        },
        {
          name: `<:gi:985100765783810151> System`,
          value: `➜ Ping: \`${client.ws.ping}ms\`\n➜ RAM: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`\n➜ Platform: \`${os.platform()}\`\n➜ Uptime: <t:${duration1}:R>`,
        },
        {
          name: `<:links:985105785921081344> Links`,
          value: `➜ [Invite](${inviteURL})\n➜ [Support Server](${supportURL})`,
          inline: true,
        },
        {
          name: `<:dev:978563383580295188> Developers`,
          value: `\`\`\`js\ndrix10\n\`\`\``,
          inline: true,
        },
        { name: `<:djs:984372533002395720> Discord.JS`, value: `\`\`\`js\n${discordJSVersion}\`\`\``, inline: true },
        { name: `<:nodejs:984372538236891196> Node.JS`,  value: `\`\`\`js\n${process.version}\`\`\``,   inline: true },
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({ text: `Thank you for using ${client.user.username} ♡` });

    message.channel.send({ embeds: [embed] });
  }
};
