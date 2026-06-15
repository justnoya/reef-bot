module.exports = {
    name: 'removenp',
    aliases: ['removenp'],
    cooldown: 3,
    category: 'owner',
    owner: true,
    botPerms: ['ViewChannel', 'SendMessages'],
    userPerms: ['ViewChannel'],
    usage: ['removenp <userID>'],
    description: 'Revokes noprefix + owner command access from a user.',
    args: true,
    run: async (client, message, args) => {
        const userId = args[0]?.replace(/[<@!>]/g, '');
        if (!userId || isNaN(userId)) {
            return message.reply({ content: 'Provide a valid user ID. Example: `!removenp 123456789`' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
        }

        if (client.config.owner.includes(userId)) {
            return message.reply({ content: 'Cannot remove access from a bot owner.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
        }

        if (!client.noprefix.includes(userId)) {
            return message.reply({ content: 'That user does not have noprefix access.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
        }

        // Remove from runtime list
        client.noprefix = client.noprefix.filter(id => id !== userId);

        // Remove from DB
        const stored = (await client.db.get('noprefix_users') || []).filter(id => id !== userId);
        await client.db.set('noprefix_users', stored);

        try { await message.delete(); } catch (_) {}

        message.channel.send({ content: `✅ Removed noprefix + owner access from <@${userId}>.` })
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
};
