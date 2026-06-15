module.exports = {
    name: 'addnp',
    aliases: ['addnp'],
    cooldown: 3,
    category: 'owner',
    owner: true,
    botPerms: ['ViewChannel', 'SendMessages'],
    userPerms: ['ViewChannel'],
    usage: ['addnp <userID>'],
    description: 'Grants a user noprefix + all owner command access.',
    args: true,
    run: async (client, message, args) => {
        const userId = args[0]?.replace(/[<@!>]/g, '');
        if (!userId || isNaN(userId)) {
            return message.reply({ content: 'Provide a valid user ID. Example: `!addnp 123456789`' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
        }

        if (client.config.owner.includes(userId)) {
            return message.reply({ content: 'That user is already a bot owner.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
        }

        if (client.noprefix.includes(userId)) {
            return message.reply({ content: 'That user already has noprefix access.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
        }

        // Add to runtime list
        client.noprefix.push(userId);

        // Persist to DB
        const stored = await client.db.get('noprefix_users') || [];
        if (!stored.includes(userId)) {
            stored.push(userId);
            await client.db.set('noprefix_users', stored);
        }

        try { await message.delete(); } catch (_) {}

        message.channel.send({ content: `✅ <@${userId}> now has noprefix + full owner command access.` })
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
};
