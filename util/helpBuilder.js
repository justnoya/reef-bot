const {
  Container, IS_COMPONENTS_V2,
  TextDisplay,
  Separator,
  ActionRow,
  Button,
  StringSelect, SelectOption,
} = require('../V2components');

const CATEGORY_MAP = {
  mod:         { emoji: '<:40:1052589138819436624>',       label: 'Moderation'       },
  automod:     { emoji: '<:4_:1052589026294632448>',       label: 'Automod'          },
  utility:     { emoji: '<:3_:1052589023794823249>',       label: 'Utility'          },
  settings:    { emoji: '<:10:1052589041717092412>',       label: 'Settings'         },
  info:        { emoji: '<:27:1052589100458315776>',       label: 'Information'      },
  welcome:     { emoji: '<a:welcome:1054639371657162812>', label: 'Welcomer'         },
  vmod:        { emoji: '<:50:1056096392860422236>',       label: 'Voice Moderation' },
  customroles: { emoji: '<:52:1056096390079598673>',       label: 'Custom Roles'     },
  economy:     { emoji: '<a:bitcoin:1055862360713220237>', label: 'Economy'          },
  music:       { emoji: '🎵',                              label: 'Music'            },
};

const PER_PAGE = 8;

function buildCategoryContainer(client, category, page, prefix, accent) {
  const info = CATEGORY_MAP[category];
  if (!info) return null;

  const cmds = client.commands
    .filter(x => x.category && x.category === category)
    .map(x => ({ name: x.name, description: x.description || 'No description available.' }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalPages = Math.max(1, Math.ceil(cmds.length / PER_PAGE));
  const safePage   = Math.min(Math.max(0, page), totalPages - 1);
  const slice      = cmds.slice(safePage * PER_PAGE, (safePage + 1) * PER_PAGE);

  const commandList = slice.length
    ? slice.map(c => `• \`${prefix}${c.name}\` — ${c.description}`).join('\n')
    : '*No commands in this category yet.*';

  const prevDisabled = safePage === 0;
  const nextDisabled = safePage >= totalPages - 1;

  const navRow = new ActionRow().addComponents(
    new Button()
      .setCustomId(prevDisabled ? 'help_noop_prev' : `helpcat_${category}_${safePage - 1}`)
      .setLabel('Previous')
      .setStyle('Secondary')
      .setDisabled(prevDisabled),
    new Button()
      .setCustomId('helpback')
      .setLabel('Back')
      .setStyle('Secondary'),
    new Button()
      .setCustomId(nextDisabled ? 'help_noop_next' : `helpcat_${category}_${safePage + 1}`)
      .setLabel('Next')
      .setStyle('Primary')
      .setDisabled(nextDisabled),
  );

  const container = new Container()
    .setAccentColor(accent)
    .addComponents(
      new TextDisplay(`## ${info.label} Commands`),
      new Separator().setDivider(true).setSpacing('Small'),
      new TextDisplay(`\`(Page ${safePage + 1}/${totalPages})\``),
      new Separator().setSpacing('Small'),
      new TextDisplay(commandList),
      new Separator().setDivider(true).setSpacing('Small'),
      new TextDisplay(
        `*Use \`${prefix}help <command>\` for detailed information*\n\n` +
        `*Powered by Cybork*`
      ),
      navRow
    );

  return container;
}

function buildMainContainer(client, prefix, accent, inviteURL, supportURL) {
  const MODULES = [
    { label: ' Home',             emoji: '<:46:1052589156787814481>',       value: 'home'        },
    { label: ' Moderation',       emoji: '<:40:1052589138819436624>',       value: 'mod'         },
    { label: ' Automod',          emoji: '<:4_:1052589026294632448>',       value: 'automod'     },
    { label: ' Utility',          emoji: '<:3_:1052589023794823249>',       value: 'utility'     },
    { label: ' Settings',         emoji: '<:10:1052589041717092412>',       value: 'settings'    },
    { label: ' Information',      emoji: '<:27:1052589100458315776>',       value: 'info'        },
    { label: ' Welcomer',         emoji: '<a:welcome:1054639371657162812>', value: 'welcome'     },
    { label: ' Voice Moderation', emoji: '<:50:1056096392860422236>',       value: 'vmod'        },
    { label: ' Custom Roles',     emoji: '<:52:1056096390079598673>',       value: 'customroles' },
    { label: ' Economy',          emoji: '<a:bitcoin:1055862360713220237>', value: 'economy'     },
    { label: ' Music',            emoji: '🎵',                              value: 'music'       },
  ];

  const selectRow = new ActionRow().addComponents(
    new StringSelect()
      .setCustomId('helpop')
      .setPlaceholder('Cybork Command Modules')
      .addOptions(MODULES.map(m =>
        new SelectOption().setLabel(m.label).setValue(m.value).setEmoji(m.emoji)
      ))
  );

  const buttonRow = new ActionRow().addComponents(
    new Button().setLabel('Invite Bot').setURL(inviteURL),
    new Button().setLabel('Support Server').setURL(supportURL)
  );

  return new Container()
    .setAccentColor(accent)
    .addComponents(
      new TextDisplay(`## ${client.user.username} Command Menu`),
      new Separator().setDivider(true).setSpacing('Small'),
      new TextDisplay(
        `**Command Information**\n` +
        `Select a category from the menu below to view available commands.\n\n` +
        `Use \`${prefix}exp <command>\` to get detailed command information and examples.`
      ),
      new Separator().setDivider(true).setSpacing('Small'),
      new TextDisplay(
        `**Found a Bug?**\n` +
        `Report issues using \`${prefix}reportbug\` to help us improve the bot.`
      ),
      new Separator().setDivider(true).setSpacing('Small'),
      new TextDisplay(
        `**Need Extra Help?**\n` +
        `Visit our [Support Server](${supportURL})\n\n` +
        `Developer: [Drix10](${supportURL})`
      ),
      new Separator().setDivider(true).setSpacing('Large'),
      selectRow,
      buttonRow
    );
}

module.exports = { buildCategoryContainer, buildMainContainer, CATEGORY_MAP, IS_COMPONENTS_V2 };
