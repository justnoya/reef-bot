
const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");
const db = require(process.cwd()+'/schema/welcomer.js')
module.exports = {
    name: "w-variables",
    description: "welcomer Message Variables.",
  category:'welcome',
  cooldown: 5,
  userPerms: ["Administrator"],
   
    run: async (client, message, args, prefix) => {
        
     
    
    let ems = new EmbedBuilder()
    .setTitle(`Welcomer Variables`)
.setDescription(`\`\`\`ansi
• [2;34m<<guild.name>>[0m   - Guild Name
• [2;34m<<guild.mc>>  [0m   - Guild Membercount
• [2;34m<<user.name>> [0m   - Username
• [2;34m<<user.tag>>[0m     - Usertag
• [2;34m<<user.mention>>[0m - User Mention
\`\`\``)
.setFooter({text: `Tip: Use ${prefix}w-message to setup a custom welcome message.`})
.setColor('#FFFFFF')


message.reply({embeds:[ems]})
}}