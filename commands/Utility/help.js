const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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

    if (!args[0]) {
      const inviteURL = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`;
      const supportURL = client.config.links.dc;

      const selectRow = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('helpop')
            .setPlaceholder('ReeF Command Modules')
            .addOptions([
              { label: ' Home',             emoji: `<:46:1052589156787814481>`,      value: 'home'        },
              { label: ' Moderation',       emoji: `<:40:1052589138819436624>`,      value: 'mod'         },
              { label: ' Automod',          emoji: `<:4_:1052589026294632448>`,      value: 'automod'     },
              { label: ' Utility',          emoji: `<:3_:1052589023794823249>`,      value: 'utility'     },
              { label: ' Settings',         emoji: `<:10:1052589041717092412>`,      value: 'settings'    },
              { label: ' Information',      emoji: `<:27:1052589100458315776>`,      value: 'info'        },
              { label: ' Welcomer',         emoji: `<a:welcome:1054639371657162812>`, value: 'welcome'    },
              { label: ' Voice Moderation', emoji: `<:50:1056096392860422236>`,      value: 'vmod'        },
              { label: ' Custom Roles',     emoji: `<:52:1056096390079598673>`,      value: 'customroles' },
              { label: ' Economy',          emoji: `<a:bitcoin:1055862360713220237>`, value: 'economy'    },
            ])
        );

      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Invite Bot')
            .setEmoji({ name: '↗️' })
            .setStyle(ButtonStyle.Link)
            .setURL(inviteURL),
          new ButtonBuilder()
            .setLabel('Support Server')
            .setEmoji({ name: '↗️' })
            .setStyle(ButtonStyle.Link)
            .setURL(supportURL)
        );

      const embed = new EmbedBuilder()
        .setTitle(`${client.user.username} Command Menu`)
        .setDescription(
          `**Command Information**\n` +
          `Select a category from the menu below to view available commands.\n\n` +
          `Use \`${prefix}exp <command>\` to get detailed command information and examples.\n\n` +
          `**Found a Bug?**\n` +
          `Report issues using \`${prefix}reportbug\` to help us improve the bot.\n\n` +
          `**Need Extra Help?**\n` +
          `Visit our [Support Server](${supportURL})\n\n` +
          `Developer: [Drix10](${supportURL})`
        )
        .setColor(
          message.guild.members.me.displayHexColor !== '#000000'
            ? message.guild.members.me.displayHexColor
            : client.config.embedColor
        );

      return message.channel.send({ embeds: [embed], components: [selectRow, buttonRow] });

    } else {
      const command =
        client.commands.get(args[0].toLowerCase()) ||
        client.commands.find(c => c.aliases && c.aliases.includes(args[0].toLowerCase()));

      if (!command) {
        const embed = new EmbedBuilder()
          .setTitle(`Invalid command! Use \`${prefix}help\` for all of my commands!`)
          .setColor(
            message.guild.members.me.displayHexColor !== '#000000'
              ? message.guild.members.me.displayHexColor
              : client.config.embedColor
          );
        return message.channel.send({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${client.user.username} Command Help`, iconURL: client.user.displayAvatarURL(), url: supportURL })
        .addFields(
          { name: "🏷️ Command Name",  value: command.name        ? `\`\`\`js\n${command.name}\`\`\``                        : "No name for this command.",        inline: true },
          { name: "🛰️ Aliases",       value: command.aliases     ? `\`\`\`js\n${command.aliases.join(", ")}\`\`\``            : "No aliases for this command.",      inline: true },
          { name: "📖 About",         value: command.description ? `\`\`\`js\n${command.description}\`\`\``                   : "No description for this command."               },
          { name: "📋 Usage",         value: command.usage       ? `\`\`\`js\n${prefix}${command.usage}\`\`\``               : `\`\`\`js\n${prefix}${command.name}\`\`\``        },
          { name: "⏲️ Cooldown",      value: command.cooldown    ? `\`\`\`js\n${command.cooldown} seconds\`\`\``             : "No Cooldown for this command."                  },
          { name: "🔐 Permissions",   value: (command.userPerms || command.botPerms) ? `\`\`\`js\n${(command.userPerms || command.botPerms).join(", ")}\`\`\`` : "No Special Permission Required" }
        )
        .setColor(
          message.guild.members.me.displayHexColor !== '#000000'
            ? message.guild.members.me.displayHexColor
            : client.config.embedColor
        );

      return message.channel.send({ embeds: [embed] });
    }
  }
};
