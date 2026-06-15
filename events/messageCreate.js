const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, Collection, PermissionsBitField, PermissionFlagsBits, Embed  } = require('discord.js');
const User = require("../Models/User");

const Guild = require("../Models/Guild")
const ms = require('ms');

const Topgg = require("@top-gg/sdk");
const topgg = new Topgg.Api(process.env.TOPGG_API || 'API');

const { msg } = require(`${process.cwd()}/util/onCoolDown.js`);

module.exports.run = async (client, message) => {
 


      
const premrow = new ActionRowBuilder()
.addComponents(new ButtonBuilder()
.setLabel("Premium")
.setStyle("Link")
.setURL(client.config.links.dc),
new ButtonBuilder()
.setLabel("Vote")
.setStyle("Link")
.setEmoji("<:vote:985926662552178748>")
.setURL(`https://top.gg/bot/${client.user.id}`));
   

   
  let uprem = await client.db.get(`uprem_${message.author.id}`);
  
  let upremend = await client.db.get(`upremend_${message.author.id}`);
//user premiums scopes ^^

  let sprem = await client.db.get(`sprem_${message.guild.id}`);

  let spremend = await client.db.get(`spremend_${message.guild.id}`);

//server premium scopes ^^
  let scot = 0;
  if(upremend && Date.now() >= upremend) 
  {
    let upremcount = await client.db.get(`upremcount_${message.author.id}`) ? await client.db.get(`upremcount_${message.author.id}`) : 0;

  let upremserver = await client.db.get(`upremserver_${message.author.id}`) ? await client.db.get(`upremserver_${message.author.id}`) : [];

  let spremown = await client.db.get(`spremown_${message.guild.id}`);
    
   await client.db.delete(`upremcount_${message.author.id}`)
    await client.db.delete(`uprem_${message.author.id}`)
    await client.db.delete(`upremend_${message.author.id}`)
    if(upremserver.length > 0){
      for(let i = 0; i < upremserver.length; i++){
        scot += 1;
        await client.db.delete(`sprem_${upremserver[i]}`)
        await client.db.delete(`spremend_${upremserver[i]}`)
        await client.db.delete(`spremown_${upremserver[i]}`)
      }
    }
   await client.db.delete(`upremserver_${message.author.id}`)
    message.author.send({embeds: [new EmbedBuilder().setColor(message.guild.members.me.displayHexColor !== '#000000' ? message.guild.members.me.displayHexColor : client.config.embedColor).setDescription(`Your Premium Has Got Expired.\nTotal **\`${scot}\`** Servers [Premium](${client.config.links.dc}) was removed.\nClick [here](${client.config.links.dc}) To Buy [Premium](${client.config.links.dc}).`)], components: [premrow]}).catch((err) => { });
  }

  if(spremend && Date.now() >= spremend)
  { 
    let scount = 0;
    
    let us = await client.db.get(`spremown_${message.guild.id}`);
    
    let upremserver = await client.db.get(`upremserver_${us}`) ? await client.db.get(`upremserver_${us}`) : [];
    
    let upremcount = await client.db.get(`upremcount_${us}`) ? await client.db.get(`upremcount_${us}`) : 0;
    
    let spremown = await client.db.get(`spremown_${message.guild.id}`).then(r => client.db.get(`upremend_${r}`));
    
    await client.db.delete(`sprem_${message.guild.id}`)
    await client.db.delete(`spremend_${message.guild.id}`)
    
    if(spremown && Date.now() > spremown){
      await client.db.delete(`upremcount_${us}`)
      await client.db.delete(`uprem_${us}`)
      await client.db.delete(`upremend_${us}`)
      
      for(let i = 0; i < upremserver.length; i++){
        scount += 1;
        await client.db.delete(`sprem_${upremserver[i]}`)
        await client.db.delete(`spremend_${upremserver[i]}`)
        await client.db.delete(`spremown_${upremserver[i]}`)
      }
    try{
    await client.users.cache.get(`${us}`).send({embeds: [new EmbedBuilder().setColor(message.guild.members.me.displayHexColor !== '#000000' ? message.guild.members.me.displayHexColor : client.config.embedColor).setDescription(`Your Premium Has Got Expired.\nTotal **\`${scount}\`** Servers [Premium](${client.config.links.dc}) was removed.\nClick [here](${client.config.links.dc}) To Buy [Premium](${client.config.links.dc}).`)], components: [premrow]}).catch((er) => { })
    }catch(errors) {
      
    }
    }
    await client.db.delete(`upremserver_${us}`)
    await client.db.delete(`spremown_${message.guild.id}`)
    message.channel.send({embeds: [new EmbedBuilder().setColor(message.guild.members.me.displayHexColor !== '#000000' ? message.guild.members.me.displayHexColor : client.config.embedColor).setDescription(`The Premium Of This Server Has Got Expired.\nClick [here](${client.config.links.dc}) To Buy [Premium](${client.config.links.dc}).`)], components: [premrow]}).catch((err) => { });
  
  }
  const em = new EmbedBuilder();
  em.setColor(message.guild.members.me.displayHexColor !== '#000000' ? message.guild.members.me.displayHexColor : client.config.embedColor);
  try {
 let prefix = await client.db.get(`prefix_${message.guild.id}`);
      if (prefix === null) prefix = client.prefix;
        
      let user = await User.findOne({ userId: message.author.id }) || new User({ userId: message.author.id }).save()
  

      
    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
var m = "";

        try {
    if (message.content.match(mention)) {
    
      const row = new ActionRowBuilder()
           .addComponents(
        new ButtonBuilder()
    .setLabel("Invite Me")
    .setStyle("Link")
    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`),
    new ButtonBuilder()
    .setLabel("Support Server")
    .setStyle("Link")
    .setURL(client.config.links.dc),
    new ButtonBuilder()
    .setLabel("Vote Me")
    .setStyle("Link")
    .setURL(`https://top.gg/bot/${client.user.id}/vote`)
                        );
      const embed = new EmbedBuilder()
        .setColor(message.guild.members.me.displayHexColor !== '#000000' ? message.guild.members.me.displayHexColor : client.config.embedColor)
        .setAuthor({name:'Settings For This Server',iconURL:client.user.displayAvatarURL() })
      
        .setDescription(`• My prefix here is \`${prefix}\` \nServer Id: \`${message.guild.id}\`\n\nType \`${prefix}help\` To Get All Commands Help Menu.`);
      message.channel.send({embeds: [embed], components: [row]})
}
            } catch (e) {
                console.log(e)
            }
        
        if (message.author.bot || !message.guild) return;
        
        
        
        
 if (!message.member) message.guild.fetchMembers(message);

 let datab = (client.noprefix || []).filter(x => x && x.trim() !== '');

 const mentionRegex = RegExp(`^<@!?${client.user.id}>$`); const mentionRegexPrefix = RegExp(`^<@!?${client.user.id}>`)
 
 const prefix1 = message.content.match(mentionRegexPrefix) ? message.content.match(mentionRegexPrefix)[0] : prefix;
     
  if(!datab.includes(message.author.id)){
                 if (!message.content.startsWith(prefix1)) return;
             } 
 
 
     const args = datab.includes(message.author.id) == false ? message.content.slice(prefix1.length).trim().split(/ +/) :  message.content.startsWith(prefix1) == true ? message.content.slice(prefix1.length).trim().split(/ +/) : message.content.trim().split(/ +/);
 



           

 
  const cmd = args.shift().toLowerCase();


  
  if (cmd.length === 0) return;


  let command = client.commands.get(cmd)

  
  if (!command) command = client.commands.get(client.aliases.get(cmd))
  
 //If cooldowns map doesn't have a command.name key then create one.
 
  if (!command) return;
  
  
    //cooldown system below
    if (msg(message, command)) {
      return await message.reply({
          embeds: [
              new EmbedBuilder()
                  .setDescription(`<:11:1052589045374533653> Please wait \`${msg(message, command).toFixed(1)}\` Before using the \`${command.name}\` command again!`)
                  
                .setColor(message.guild.members.me.displayHexColor !== '#000000' ? message.guild.members.me.displayHexColor : client.config.embedColor)
              ]
          }).then(m => setTimeout(() => m.delete(), msg(message, command) * 1000));
      } 
      //end cooldown
      //perms handler
      if (command.userPerms) {
        if (!message.member.permissions.has(PermissionsBitField.resolve(command.userPerms|| []))) return message.reply({
            content: `${message.author} You need \`${command.userPerms}\` permissions to use this command`
        })
    }
    
    if (command.botPerms) {
        if (!message.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(command.botPerms || []))) return message.reply({
            content: `${message.author.tag} I don't have the \`${command.botPerms}\` permissions to run this command`})
    };
      //perms finish
    
  
  if (command.args && !args.length) {
    const provide = new EmbedBuilder()
    .setColor(`#ff0000`)
    .setDescription(`<:11:1052589045374533653> You didn't provide any arguments!`)
    return message.channel.send({embeds: [provide]})
  }
  //premium starts
  if(command.premium)
   {
     let voted = await client.topgg.hasVoted(message.author.id);
    if(!client.config.owner.includes(message.author.id)  && !voted && !uprem && !sprem){
    const row = new ActionRowBuilder()
    .addComponents(new ButtonBuilder()
    .setLabel("Premium")
    .setStyle("Link")
    .setURL(client.config.links.dc),
    new ButtonBuilder()
    .setLabel("Vote")
    .setStyle("Link")
    .setEmoji("<:vote:985926662552178748>")
    .setURL(`https://top.gg/bot/${client.user.id}/vote`)
                        );
      em.setDescription(`You must [vote](https://top.gg/bot/${client.user.id}/vote) me to use this command. If you want to disable this then [click here](${client.config.links.dc}) to buy [premium](${client.config.links.dc}) to listen interruption free **music**!`)
      .setColor(message.guild.members.me.displayHexColor !== '#000000' ? message.guild.members.me.displayHexColor : client.config.embedColor)
    return message.channel.send({embeds: [em], components: [row]})
    }
  } 
  //premium ends
  //nothinf
  
  //owner
   if (command.owner) {
      const ownerList = client.config.owner.filter(x => x && x.trim() !== '');
      const npList = (client.noprefix || []).filter(x => x && x.trim() !== '');
      const allowed = [...new Set([...ownerList, ...npList])];
      if (!allowed.includes(message.author.id))
        return message.channel.send({
          embeds: [new EmbedBuilder().setColor(message.guild.members.me.displayHexColor !== '#000000' ? message.guild.members.me.displayHexColor : client.config.embedColor).setDescription('Only My Owners can use this command!')],
        });
    }
    user.count++;
    await user.save();
        
    if(user.blacklisted){
      return message.channel.send({embeds:[new EmbedBuilder().setColor(message.guild.members.me.displayHexColor !== '#000000' ? message.guild.members.me.displayHexColor : client.config.embedColor).setDescription('You are Blacklisted From Using the Bot\nYou can Appeal For Your Blacklist At Our Support Server.')]})
            }
  if (command) command.run(client, message, args, prefix)

} catch (error) {
    console.error(error)
}


}
