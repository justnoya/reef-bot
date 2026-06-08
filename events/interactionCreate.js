const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, Collection, PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const { Container, IS_COMPONENTS_V2, TextDisplay, Separator } = require('../V2components');




const User = require("../Models/User");

const { slash } = require(`${process.cwd()}/util/onCoolDown.js`);


module.exports.run = async (client, interaction, args) => {
   let user = await User.findOne({ userId: interaction.user.id }) || new User({ userId: interaction.user.id });
   let prefix = await client.db.get(`prefix_${interaction.guild.id}`);
   if (prefix === null) prefix = client.prefix;
  const music = new EmbedBuilder();
  music.setFooter({text:`Requested by ${interaction.user.tag}`})
  const embed = new EmbedBuilder();
  const premrow = new ActionRowBuilder()
     .addComponents(new ButtonBuilder()
     .setLabel("Premium")
     .setStyle("Link")
     .setURL(client.config.links.dc),
     new ButtonBuilder()
     .setLabel("Vote")
     .setStyle("Link")
     .setEmoji("<:vote:985926662552178748>")
     .setURL(`https://top.gg/bot/${client.user.id}/vote`));
        
     music.setColor(interaction.guild.members.me.displayHexColor !== '#000000' ? interaction.guild.members.me.displayHexColor : client.config.embedColor)

    if(interaction.isSelectMenu())
    {
      const funny  = interaction.values[0];
      const accent = interaction.guild.members.me.displayHexColor !== '#000000'
        ? interaction.guild.members.me.displayHexColor
        : client.config.embedColor;

      const CATEGORY_MAP = {
        mod:         { emoji: '<:40:1052589138819436624>',       label: 'Moderation'      },
        automod:     { emoji: '<:4_:1052589026294632448>',       label: 'Automod'         },
        utility:     { emoji: '<:3_:1052589023794823249>',       label: 'Utility'         },
        settings:    { emoji: '<:10:1052589041717092412>',       label: 'Settings'        },
        info:        { emoji: '<:27:1052589100458315776>',       label: 'Information'     },
        welcome:     { emoji: '<a:welcome:1054639371657162812>', label: 'Welcomer'        },
        vmod:        { emoji: '<:50:1056096392860422236>',       label: 'Voice Moderation'},
        customroles: { emoji: '<:52:1056096390079598673>',       label: 'Custom Roles'    },
        economy:     { emoji: '<a:bitcoin:1055862360713220237>', label: 'Economy'         },
      };

      if (funny === 'home') {
        const inviteURL  = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`;
        const supportURL = client.config.links.dc;
        const container  = new Container()
          .setAccentColor(accent)
          .addComponents(
            new TextDisplay(`## <:46:1052589156787814481>  ${client.user.username} — Home`),
            new Separator().setDivider(true).setSpacing('Small'),
            new TextDisplay(
              `**General Help**\n` +
              `My prefix here is: \`${prefix}\`\n` +
              `Use the select menu to browse commands.\n` +
              `For further help [click here](${supportURL}).`
            ),
            new Separator().setDivider(true).setSpacing('Small'),
            new TextDisplay(
              `**Modules**\n` +
              `Moderation · Automod · Utility · Settings\n` +
              `Information · Welcomer · Voice Moderation · Custom Roles · Economy`
            ),
            new Separator().setDivider(true).setSpacing('Small'),
            new TextDisplay(
              `**Quick Links**\n` +
              `[Invite ${client.user.username}](${inviteURL})  ·  [Support Server](${supportURL})`
            ),
            new Separator().setSpacing('Small'),
            new TextDisplay(`-# Type \`${prefix}help <command>\` for detailed info on any command.`)
          );
        return interaction.update({
          components: [container.toJSON()],
          flags: IS_COMPONENTS_V2,
        }).catch(() => {});
      }

      if (CATEGORY_MAP[funny]) {
        const { emoji, label } = CATEGORY_MAP[funny];
        const cmds = client.commands
          .filter(x => x.category && x.category === funny)
          .map(x => `\`${x.name}\``)
          .sort();

        const container = new Container()
          .setAccentColor(accent)
          .addComponents(
            new TextDisplay(`## ${emoji}  ${label}  \`[${cmds.length}]\``),
            new Separator().setDivider(true).setSpacing('Small'),
            new TextDisplay(cmds.length ? cmds.join('  ') : '*No commands in this category yet.*'),
            new Separator().setSpacing('Small'),
            new TextDisplay(`-# Type \`${prefix}help <command>\` for detailed info on any command.`)
          );
        return interaction.update({
          components: [container.toJSON()],
          flags: IS_COMPONENTS_V2,
        }).catch(() => {});
      }

    }
if (interaction.isCommand()) {
   
        const command = client.slash.get(interaction.commandName);
        if (!command) return interaction.reply({ content: 'an Error Occured plz contact support server' });
       
        
if (!command) return

  

  if (command.cooldown && slash(interaction, command)) {
    return interaction.reply({
        ephemeral: true,
        embeds: [
            new EmbedBuilder()
            .setDescription(`<:11:1052589045374533653> Please wait \`${slash(interaction, command).toFixed(1)}\` Before using the \`${command.name}\` command again!`)
                  
            .setColor(interaction.guild.members.me.displayHexColor !== '#000000' ? interaction.guild.members.me.displayHexColor : client.config.embedColor)
              
        ]
    })
}

//perms handler
  if (command.userPerms) {
    if (!interaction.member.permissions.has(PermissionsBitField.resolve(command.userPerms|| []))) return interaction.reply({
        content: `${interaction.member} You need \`${command.userPerms}\` permissions to use this command`}).then(setTimeout(() => interaction.deleteReply(), 5000))
}

if (command.botPerms) {
    if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(command.botPerms || []))) return interaction.reply({
        content: `${interaction.member} I don't have the \`${command.botPerms}\` permissions to run this command`}).then(setTimeout(() => interaction.deleteReply(), 5000))
};
    
    if (command.owner) {
      if (client.config.owner) {
        const devs = client.config.owner.find((x) => x === interaction.user.id);
        if (!devs)
          return interaction.reply({
            embeds: [music.setDescription('Only My Owners can use this command!')],
          });
      }
    }  
    if(user.blacklisted){
      return interaction.reply({embeds:[new EmbedBuilder().setColor(interaction.guild.members.me.displayHexColor !== '#000000' ? interaction.guild.members.me.displayHexColor : client.config.embedColor).setDescription('You are Blacklisted From Using the Bot\nYou can Appeal For Your Blacklist At Our Support Server.')]})
            }
      
    try {

      command.run(client, interaction)
      user.ccount++;
      await user.save();
  
  } catch (e) {

      interaction.reply({ content: e.interaction });


  }
  }
  
}
