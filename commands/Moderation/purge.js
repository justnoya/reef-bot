const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'purge',
  aliases: ['clear', 'prune', 'cls'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['ManageMessages', 'ReadMessageHistory', 'ViewChannel'],
  userPerms: ['ManageMessages'],
  description: 'Bulk delete messages from a channel',
  usage: ['purge <amount>', 'purge <amount> @user'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    const err = t => message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay(`<:error:1425509196773720177> ${t}`)).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100)
      return err('Please provide a number between **1** and **100**.');

    const target = message.mentions.users.first();
    await message.delete().catch(() => {});

    let messages = await message.channel.messages.fetch({ limit: 100 });
    if (target) messages = messages.filter(m => m.author.id === target.id);
    const toDelete = [...messages.values()].slice(0, amount);
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const bulkable = toDelete.filter(m => m.createdTimestamp > twoWeeksAgo);

    if (!bulkable.length) return err('No messages found to delete (messages older than 14 days cannot be bulk deleted).');
    await message.channel.bulkDelete(bulkable, true);

    const info = await message.channel.send({
      components: [new Container().setAccentColor(accent).addComponents(
        new TextDisplay(`## <:moderation:1516337259157131365> Messages Purged`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **Deleted:** \`${bulkable.length}\` messages\n` +
          (target ? `➜ **Filter:** Messages from <@${target.id}>\n` : '') +
          `➜ **Moderator:** <@${message.author.id}>`
        )
      ).toJSON()],
      flags: IS_COMPONENTS_V2
    });
    setTimeout(() => info.delete().catch(() => {}), 5000);
  }
};
