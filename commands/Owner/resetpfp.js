const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'resetpfp',
  aliases: ['resetbann', 'resetavatar'],
  cooldown: 5,
  category: 'owner',
  owner: true,
  description: 'Clears the per-server avatar and/or banner, reverting to the global bot default.',
  run: async (client, message, args) => {
    const mode = (args[0] || '').toLowerCase();

    const resetAvatar = mode === 'banner' ? false : true;
    const resetBanner = mode === 'avatar' ? false : true;

    const what = resetAvatar && resetBanner ? 'avatar & banner'
      : resetAvatar ? 'avatar'
      : 'banner';

    const loadingMsg = await message.reply({ content: `⏳ Resetting per-server ${what}...` });

    const body = {};
    if (resetAvatar) body.avatar = null;
    if (resetBanner) body.banner = null;

    try {
      await message.guild.members.editMe(body);

      const lines = [];
      if (resetAvatar) lines.push('🖼️ **Per-server avatar** removed — global avatar is now shown.');
      if (resetBanner) lines.push('🎨 **Per-server banner** removed — global banner is now shown.');

      const container = new Container()
        .setAccentColor(0xFFFFFF)
        .addComponents(
          new TextDisplay(`## ✅ Reset Complete\n**${message.guild.name}**`),
          new Separator().setDivider(true).setSpacing('Small'),
          new TextDisplay(lines.join('\n'))
        );

      await loadingMsg.delete().catch(() => {});
      await message.channel.send({ flags: IS_COMPONENTS_V2, components: [container.toJSON()] });
      await message.delete().catch(() => {});

    } catch (err) {
      console.error('[resetpfp]', err.message);
      let reply = `❌ Failed: ${err.message}`;
      if (err.status === 429) reply = '❌ Rate limited — wait a moment and try again.';
      loadingMsg.edit({ content: reply }).catch(() => {});
    }
  },
};
