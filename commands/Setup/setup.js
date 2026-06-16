const {
  Container, TextDisplay, Separator,
  ActionRow, Button, StringSelect, SelectOption,
  IS_COMPONENTS_V2,
} = require('../../V2components');

const TERMS_URL   = 'https://discord.gg/cybork';
const PRIVACY_URL = 'https://discord.gg/cybork';

function buildSetupContainer(guild, role = null, termsAccepted = false) {
  const termsKey   = role || 'none';
  const confirmKey = role && termsAccepted ? role : 'none';

  const ownerOpt = new SelectOption()
    .setLabel('Owner')
    .setValue('owner')
    .setDescription('Server owner — full setup access');
  if (role === 'owner') ownerOpt.setDefault(true);

  const otherOpt = new SelectOption()
    .setLabel('Other')
    .setValue('other')
    .setDescription('Administrator or trusted staff member');
  if (role === 'other') otherOpt.setDefault(true);

  const roleRow = new ActionRow().addComponents(
    new StringSelect()
      .setCustomId('setup_role')
      .setPlaceholder(role ? `Selected: ${role === 'owner' ? 'Owner' : 'Other'}` : 'Select your role...')
      .addOptions(ownerOpt, otherOpt)
  );

  const termsBtn = new Button()
    .setCustomId(`setup_terms_${termsKey}`)
    .setLabel(termsAccepted ? '☑  Terms & Privacy Accepted' : '☐  Accept Terms & Privacy')
    .setStyle(termsAccepted ? 'Success' : 'Secondary')
    .setDisabled(!role || termsAccepted);

  const confirmBtn = new Button()
    .setCustomId(`setup_confirm_${confirmKey}`)
    .setLabel('Confirm Setup')
    .setStyle('Primary')
    .setDisabled(!role || !termsAccepted);

  const btnRow = new ActionRow().addComponents(termsBtn, confirmBtn);

  return new Container()
    .setAccentColor('#FFFFFF')
    .addComponents(
      new TextDisplay('## ⚙️ Server Setup'),
      new TextDisplay(`Setting up **${guild.name}**. Complete both steps below to finish.`),
      new Separator().setDivider(true).setSpacing('Large'),
      new TextDisplay('**Step 1 — Select your role**\n-# Choose *Owner* if you are the server owner, otherwise choose *Other*.'),
      roleRow,
      new Separator().setDivider(false).setSpacing('Small'),
      new TextDisplay(`**Step 2 — Accept Terms & Privacy**\n-# By proceeding you agree to our [Terms of Service](${TERMS_URL}) and [Privacy Policy](${PRIVACY_URL}).`),
      btnRow
    );
}

module.exports = {
  name: 'setup',
  aliases: [],
  cooldown: 10,
  category: 'Setup',
  botPerms: ['ViewChannel', 'SendMessages'],
  userPerms: ['Administrator'],
  usage: ['setup'],
  description: 'Run the initial server setup for Cybork',

  buildSetupContainer,

  run: async (client, message) => {
    const container = buildSetupContainer(message.guild);
    await message.channel.send({
      components: [container.toJSON()],
      flags: IS_COMPONENTS_V2,
    }).catch(err => {
      message.reply({ content: `❌ Failed to send setup panel: \`${err.message}\`` }).catch(() => {});
    });
  },
};
