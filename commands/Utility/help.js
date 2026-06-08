const { EmbedBuilder } = require("discord.js");
const {
  Container, IS_COMPONENTS_V2,
  TextDisplay,
  Separator,
  ActionRow,
  Button, ButtonStyle,
  StringSelect, SelectOption,
} = require("../../V2components");

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
];

module.exports = {
  name: "help",
  aliases: ['h'],
  cooldown: 5,
  category: 'utility',
  botPerms: ['ViewChannel', 'EmbedLinks', 'UseExternalEmojis'],
  userPerms: ['ViewChannel'],
  usage: ['h', 'help'],
  description: "Gives My All command info",

  run: async (client, message, args) => {
    let prefix = await client.db.get(`prefix_${message.guild.id}`);
    if (prefix === null) prefix = client.prefix;

    const accentColor = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor
      : client.config.embedColor;

    const inviteURL  = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`;
    const supportURL = client.config.links.dc;

    if (!args[0]) {
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

      const container = new Container()
        .setAccentColor(accentColor)
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

      return message.channel.send({
        components: [container.toJSON()],
        flags: IS_COMPONENTS_V2,
      });

    } else {
      const command =
        client.commands.get(args[0].toLowerCase()) ||
        client.commands.find(c => c.aliases && c.aliases.includes(args[0].toLowerCase()));

      if (!command) {
        const container = new Container()
          .setAccentColor('#ff0000')
          .addComponents(
            new TextDisplay(`❌  Command \`${args[0]}\` not found. Use \`${prefix}help\` to see all commands.`)
          );
        return message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
      }

      const container = new Container()
        .setAccentColor(accentColor)
        .addComponents(
          new TextDisplay(`## 🏷️  ${command.name}`),
          new Separator().setDivider(true).setSpacing('Small'),
          new TextDisplay(
            `**Description**\n${command.description || 'No description.'}`
          ),
          new Separator().setSpacing('Small'),
          new TextDisplay(
            `**Usage**\n\`${prefix}${Array.isArray(command.usage) ? command.usage.join(`\`  \`${prefix}`) : command.usage || command.name}\``
          ),
          new Separator().setSpacing('Small'),
          new TextDisplay(
            `**Aliases**\n${command.aliases ? command.aliases.map(a => `\`${a}\``).join('  ') : '`none`'}`
          ),
          new Separator().setSpacing('Small'),
          new TextDisplay(
            `**Cooldown**\n${command.cooldown ? `\`${command.cooldown}s\`` : '`none`'}` +
            `\u2000\u2000**Category**\n\`${command.category || 'utility'}\``
          ),
          new Separator().setDivider(true).setSpacing('Small'),
          new TextDisplay(
            `**User Permissions**\n${command.userPerms ? command.userPerms.map(p => `\`${p}\``).join('  ') : '`none`'}\n` +
            `**Bot Permissions**\n${command.botPerms ? command.botPerms.map(p => `\`${p}\``).join('  ') : '`none`'}`
          )
        );

      return message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
    }
  }
};
