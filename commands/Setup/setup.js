const {
  Container, TextDisplay, Separator,
  MediaGallery, MediaGalleryItem,
  ActionRow, Button, IS_COMPONENTS_V2,
} = require('../../V2components');

function buildGiftCard(client, guild, claimed = false, claimedBy = null) {
  const botAvatar = client.user.displayAvatarURL({ size: 1024, extension: 'png' });
  const accent    = claimed ? '#57F287' : '#FFFFFF';

  const heroImage = new MediaGallery().addItems(
    new MediaGalleryItem().setURL(botAvatar).setDescription('Cybork Turbo Gift')
  );

  const claimRow = new ActionRow().addComponents(
    claimed
      ? new Button()
          .setCustomId('cybork_turbo_noop')
          .setLabel('✓  Claimed')
          .setStyle('Secondary')
          .setDisabled(true)
      : new Button()
          .setCustomId('cybork_turbo_claim')
          .setLabel('🎁  Claim')
          .setStyle('Success')
  );

  if (claimed) {
    return new Container()
      .setAccentColor(accent)
      .addComponents(
        heroImage,
        new Separator().setSpacing('Small'),
        new TextDisplay('🎉  **Congratulations!**'),
        new TextDisplay('## <:turbo:1516337651417092177>  Cybork Turbo'),
        new TextDisplay(
          `You have successfully claimed your **Cybork Turbo** gift!\n\n` +
          (claimedBy ? `> Claimed by <@${claimedBy}>` : '')
        ),
        new Separator().setDivider(true).setSpacing('Small'),
        claimRow
      );
  }

  return new Container()
    .setAccentColor(accent)
    .addComponents(
      heroImage,
      new Separator().setSpacing('Small'),
      new TextDisplay('✨  **A WILD GIFT APPEARS!**'),
      new TextDisplay('## <:turbo:1516337651417092177>  Cybork Turbo'),
      new TextDisplay(
        `**${client.user.username}** is gifting you a premium subscription!\n\n` +
        `> **Server:** ${guild.name}\n` +
        `> **Server ID:** \`${guild.id}\`\n` +
        `> **Owner ID:** \`${guild.ownerId}\`\n` +
        `> **Members:** \`${guild.memberCount}\``
      ),
      new Separator().setDivider(true).setSpacing('Small'),
      claimRow
    );
}

module.exports = {
  name: 'setup',
  aliases: ['cyborkgift'],
  cooldown: 10,
  category: 'setup',
  botPerms: ['ViewChannel', 'EmbedLinks'],
  userPerms: ['ManageGuild'],
  usage: ['setup'],
  description: 'Sends a Cybork Turbo gift card for this server',

  run: async (client, message) => {
    const container = buildGiftCard(client, message.guild, false);
    message.channel.send({
      components: [container.toJSON()],
      flags: IS_COMPONENTS_V2,
    });
  },

  buildGiftCard,
};
