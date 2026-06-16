const { Container, TextDisplay, Separator, Section, Thumbnail, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'emojiinfo',
  aliases: ['ei', 'emoji'],
  cooldown: 5,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'Shows detailed information about a custom emoji',
  usage: ['emojiinfo <emoji>'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const emojiArg = args[0];
    const customMatch = emojiArg.match(/<?(a?):(\w+):(\d+)>?/);
    if (!customMatch) return err('Please provide a custom emoji. Standard Unicode emojis are not supported.');

    const animated = !!customMatch[1];
    const name     = customMatch[2];
    const id       = customMatch[3];
    const ext      = animated ? 'gif' : 'png';
    const url      = `https://cdn.discordapp.com/emojis/${id}.${ext}?size=256`;

    const guildEmoji = message.guild.emojis.cache.get(id);
    const created    = guildEmoji ? `<t:${Math.round(guildEmoji.createdTimestamp / 1000)}:R>` : '`Unknown`';
    const author     = guildEmoji?.author ? `<@${guildEmoji.author.id}>` : '`Unknown`';
    const usable     = guildEmoji ? '`Yes`' : '`External`';

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new Section()
          .addComponents(
            new TextDisplay(`## :${name}:`),
            new TextDisplay(`\`${animated ? '<a' : '<'}:${name}:${id}>\``)
          )
          .setAccessory(new Thumbnail().setURL(url)),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **ID:** \`${id}\`\n` +
          `➜ **Name:** \`${name}\`\n` +
          `➜ **Animated:** \`${animated ? 'Yes' : 'No'}\`\n` +
          `➜ **Usable Here:** ${usable}\n` +
          `➜ **Created:** ${created}\n` +
          `➜ **Added By:** ${author}`
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(`**URL**\n[Open full size](${url})`)
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
