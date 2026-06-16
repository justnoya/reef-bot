const {  EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "hide",
    cooldown: 5,
    description: "hide a channel.",
  category:'mod',
  userPerms: ["ManageChannels"],
    
    run: async (client, message, args, prefix) => {
var botperm = message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles) || message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)

            var uperm = message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) || message.member.permissions.has(PermissionsBitField.Flags.Administrator)
let upn = new EmbedBuilder()
   
    .setDescription(`You don\'t have permission to use this command.`)
.setColor('#FFFFFF')
let bpn = new EmbedBuilder()
   
    .setDescription(`I don\'t have permission to run this command.`)
.setColor('#FFFFFF')

      if(!uperm)
return message.reply({embeds:[upn]});
      if(!botperm)
return message.reply({embeds:[bpn]});
      
      

    const reason = args.slice(1).join(" ") || 'Not provided';

const channel = message.channels.mentions.first() || message.channel;
        
let nocha = new EmbedBuilder()
.setDescription(`That\'s not a text/voice-text channel.`)
.setColor('#FFFFFF')

      if(!channel.isTextBased())
return message.reply({embeds:[nocha]});

        
 

  

    
await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
 ViewChannel: false
},{reason: reason + ' | '+ message.author.tag + ' '+message.author.id})



      const hidden = new EmbedBuilder()
     .setColor('#FFFFFF')
.setDescription(`<#${channel.id}> has been hidden.`)

     
    message.reply({
        embeds: [hidden]
      })
  
      
    }}
