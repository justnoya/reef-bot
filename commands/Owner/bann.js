const { Container, TextDisplay, Separator, Section, Thumbnail, IS_COMPONENTS_V2 } = require('../../V2components');

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} while fetching image`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) throw new Error('Image must be under 8 MB.');
  return buf;
}

module.exports = {
  name: 'bann',
  aliases: [],
  cooldown: 10,
  category: 'owner',
  owner: true,
  description: "Sets the bot's per-server profile banner (only this server — does not change other servers).",
  run: async (client, message) => {
    let imageURL = null;
    let source = 'server banner';

    if (message.reference?.messageId) {
      try {
        const replied = await message.channel.messages.fetch(message.reference.messageId);
        const att = replied.attachments.find(a =>
          a.contentType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(a.url)
        );
        if (att) { imageURL = att.url; source = 'replied image'; }
        if (!imageURL && replied.embeds.length) {
          const img = replied.embeds[0]?.image?.url || replied.embeds[0]?.thumbnail?.url;
          if (img) { imageURL = img; source = 'replied image'; }
        }
      } catch (_) {}
    }

    if (!imageURL) {
      const att = message.attachments.find(a =>
        a.contentType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(a.url)
      );
      if (att) { imageURL = att.url; source = 'attached image'; }
    }

    if (!imageURL) {
      imageURL = message.guild.bannerURL({ extension: 'png', size: 1024 });
      if (!imageURL) {
        return message.reply({
          content: '❌ This server has no banner. Reply to an image or attach one.',
        });
      }
    }

    const loadingMsg = await message.reply({ content: '⏳ Setting per-server banner...' });

    try {
      const buffer = await fetchBuffer(imageURL);
      const updatedMember = await message.guild.members.editMe({ banner: buffer });

      const newBannerURL = updatedMember.bannerURL({ size: 512 }) || imageURL;

      const container = new Container()
        .setAccentColor(0xFFFFFF)
        .addComponents(
          new Section()
            .addComponents(new TextDisplay(
              `## ✅ Per-Server Banner Set\n**${message.guild.name}**\nSource: **${source}**`
            ))
            .setAccessory(new Thumbnail().setURL(newBannerURL)),
          new Separator().setDivider(true).setSpacing('Small'),
          new TextDisplay(
            'This banner shows **only in this server** when your profile is viewed.\n' +
            'The global bot banner in all other servers is unchanged.\n' +
            '> Best results: **16:9 ratio** (e.g. 1920×1080).'
          )
        );

      await loadingMsg.delete().catch(() => {});
      await message.channel.send({ flags: IS_COMPONENTS_V2, components: [container.toJSON()] });
      await message.delete().catch(() => {});

    } catch (err) {
      console.error('[bann]', err.message);
      let reply = `❌ Failed: ${err.message}`;
      if (err.message?.includes('8 MB')) reply = '❌ Image is too large (max 8 MB).';
      else if (err.rawError?.message?.includes('Invalid') || err.status === 400)
        reply = '❌ Discord rejected this image — try a PNG or JPG under 8 MB, 16:9 ratio.';
      else if (err.status === 429) reply = '❌ Rate limited — wait a moment and try again.';
      loadingMsg.edit({ content: reply }).catch(() => {});
    }
  },
};
