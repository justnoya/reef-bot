const { IS_COMPONENTS_V2, buildMainContainer, buildCategoryContainer } = require('../../util/helpBuilder');

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

    const accent     = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor
      : client.config.embedColor;
    const inviteURL  = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`;
    const supportURL = client.config.links.dc;

    if (!args[0]) {
      const container = buildMainContainer(client, prefix, accent, inviteURL, supportURL);
      return message.channel.send({
        components: [container.toJSON()],
        flags: IS_COMPONENTS_V2,
      });
    }

    // !help <command>
    const command =
      client.commands.get(args[0].toLowerCase()) ||
      client.commands.find(c => c.aliases && c.aliases.includes(args[0].toLowerCase()));

    const { Container, TextDisplay, Separator } = require('../../V2components');

    if (!command) {
      const container = new Container()
        .setAccentColor('#ff0000')
        .addComponents(
          new TextDisplay(`❌  Command \`${args[0]}\` not found. Use \`${prefix}help\` to see all commands.`)
        );
      return message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
    }

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## 🏷️  ${command.name}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(`**Description**\n${command.description || 'No description.'}`),
        new Separator().setSpacing('Small'),
        new TextDisplay(
          `**Usage**\n\`${prefix}${Array.isArray(command.usage)
            ? command.usage.join(`\`  \`${prefix}`)
            : (command.usage || command.name)}\``
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(
          `**Aliases**\n${command.aliases ? command.aliases.map(a => `\`${a}\``).join('  ') : '`none`'}`
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(
          `**Cooldown**  ${command.cooldown ? `\`${command.cooldown}s\`` : '`none`'}` +
          `\u2000\u2000**Category**  \`${command.category || 'utility'}\``
        ),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `**User Permissions**\n${command.userPerms ? command.userPerms.map(p => `\`${p}\``).join('  ') : '`none`'}\n` +
          `**Bot Permissions**\n${command.botPerms  ? command.botPerms.map(p => `\`${p}\``).join('  ')  : '`none`'}`
        )
      );

    return message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
