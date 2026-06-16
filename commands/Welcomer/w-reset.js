
const { Commandmessage, Client, EmbedBuilder, PermissionsBitField, ApplicationCommandOpt, messageLinkionType } = require("discord.js");
const db = require(process.cwd()+'/schema/welcomer.js')
module.exports = {
    name: "w-reset",
    description: "Reset welcomer.",
  category:'welcome',
  cooldown: 5,
  userPerms: ["Administrator"],
   


    run: async (client, message, args, prefix) => {
        
    
    

 
        
        
let data = await db.findOne({'guild': message.guild.id})

let lolXd = new EmbedBuilder()
.setDescription(`<:11:1052589045374533653> Welcomer is already disabled.`)
.setColor('#FFFFFF')

if(!data) {
return message.reply({embeds:[lolXd]});
}

 await db.updateOne({ guild: message.guild.id }, { enabled: false});;
 


const xddn = new EmbedBuilder()
.setDescription(`<:11:1052589045374533653> Welcomer data is now cleared.`)
.setColor('#FFFFFF')

message.reply({embeds:[xddn]})
}}