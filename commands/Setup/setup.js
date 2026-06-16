const path = require('path');
const {
  Container, TextDisplay, Separator,
  Section, Thumbnail,
  ActionRow, Button, IS_COMPONENTS_V2,
} = require('../../V2components');

const TURBO_IMG_PATH = path.join(__dirname, '../../assets/cybork_turbo.png');
const TURBO_IMG_REF  = 'attachment://cybork_turbo.png';

function buildGiftFiles() {
  return [{ attachment: TURBO_IMG_PATH, name: 'cybork_turbo.png' }];
}

function buildGiftCard(gifterName, claimed = false, claimedBy = null) {
  const claimRow = new ActionRow().addComponents(
    claimed
      ? new Button()
          .setCustomId('cybork_turbo_noop')
          .setLabel('Accepted')
          .setStyle('Secondary')
          .setDisabled(true)
      : new Button()
          .setCustomId('cybork_turbo_claim')
          .setLabel('Accept')
          .setStyle('Primary')
  );

  if (claimed) {
    return new Container()
      .setAccentColor('#FFFFFF')
      .addComponents(
        new Section()
          .addComponents(
            new TextDisplay(`**You've claimed a subscription!**`),
            new TextDisplay(`You've redeemed **Cybork Turbo** for **1 month!**`),
            new TextDisplay(`-# Claimed by <@${claimedBy}>`)
          )
          .setAccessory(new Thumbnail().setURL(TURBO_IMG_REF)),
        claimRow
      );
  }

  return new Container()
    .setAccentColor('#FFFFFF')
    .addComponents(
      new Section()
        .addComponents(
          new TextDisplay(`**You've been gifted a subscription!**`),
          new TextDisplay(`**${gifterName}** has gifted you **Cybork Turbo** for **1 month!**`),
          new TextDisplay(`-# Expires in 47 hours`)
        )
        .setAccessory(new Thumbnail().setURL(TURBO_IMG_REF)),
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
    const gifterName = message.member?.displayName || message.author.username;
    const container  = buildGiftCard(gifterName, false);
    message.channel.send({
      components: [container.toJSON()],
      files: buildGiftFiles(),
      flags: IS_COMPONENTS_V2,
    });
  },

  buildGiftCard,
  buildGiftFiles,
};
