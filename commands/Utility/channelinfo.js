const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');
const { ChannelType } = require('discord.js');

const TYPE_MAP = {
  [ChannelType.GuildText]:        'Text Channel',
  [ChannelType.GuildVoice]:       'Voice Channel',
  [ChannelType.GuildCategory]:    'Category',
  [ChannelType.GuildAnnouncement]:'Announcement Channel',
  [ChannelType.GuildStageVoice]:  'Stage Channel',
  [ChannelType.GuildForum]:       'Forum Channel',
  [ChannelType.GuildThread]:      'Thread',
  [ChannelType.PublicThread]:     'Public Thread',
  [ChannelType.PrivateThread]:    'Private Thread',
};

module.exports = {
  name: 'channelinfo',
  aliases: ['ci', 'cinfo'],
  cooldown: 5,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'Shows detailed information about a channel',
  usage: ['channelinfo', 'channelinfo #channel'],
  run: async (client, message, args) => {
    const accent = '#FFFFFF';

    const channel = message.mentions.channels.first()
      || message.guild.channels.cache.get(args[0])
      || message.channel;

    const type      = TYPE_MAP[channel.type] || 'Unknown';
    const created   = `<t:${Math.round(channel.createdTimestamp / 1000)}:R>`;
    const category  = channel.parent?.name || '`None`';
    const position  = channel.rawPosition ?? '`N/A`';
    const slowmode  = channel.rateLimitPerUser ? `\`${channel.rateLimitPerUser}s\`` : '`None`';
    const nsfw      = channel.nsfw ? '`Yes`' : '`No`';
    const topic     = channel.topic ? channel.topic.slice(0, 100) : '`No topic set`';
    const members   = channel.members?.size ?? '`N/A`';

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:utility:1516337285925179422> #${channel.name}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **ID:** \`${channel.id}\`\n` +
          `➜ **Type:** \`${type}\`\n` +
          `➜ **Category:** \`${category}\`\n` +
          `➜ **Position:** \`${position}\`\n` +
          `➜ **Created:** ${created}`
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(
          `**Properties**\n` +
          `➜ **Slowmode:** ${slowmode}\n` +
          `➜ **NSFW:** ${nsfw}\n` +
          `➜ **Members:** \`${members}\`\n` +
          `➜ **Topic:** ${topic}`
        )
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
