module.exports = {
    name: 's',
    aliases: ['s'],
    cooldown: 3,
    category: 'utility',
    owner: true,
    botPerms: ['ManageWebhooks', 'ViewChannel', 'ManageMessages'],
    userPerms: ['ManageMessages'],
    usage: ['s'],
    description: 'Stops the running message loop and deletes all looped messages.',
    run: async (client, message) => {
        const loopData = client.fuLoops.get(message.channel.id);
        if (!loopData) {
            return message.reply({ content: 'No loop is running in this channel.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }

        // Mark inactive first so any in-flight sendNext calls bail out immediately
        loopData.active = false;
        clearInterval(loopData.interval);
        client.fuLoops.delete(message.channel.id);

        // Destroy the webhook so nothing can send anymore
        try { await loopData.webhookClient.delete(); } catch (_) {}

        // Delete the !s command message itself
        try { await message.delete(); } catch (_) {}

        // Bulk delete all looped messages (handles 14-day Discord limit)
        const { sentIds } = loopData;
        const chunkSize = 100;
        for (let i = 0; i < sentIds.length; i += chunkSize) {
            const chunk = sentIds.slice(i, i + chunkSize);
            try {
                await message.channel.bulkDelete(chunk, true);
            } catch (_) {
                for (const id of chunk) {
                    try {
                        const m = await message.channel.messages.fetch(id);
                        await m.delete();
                    } catch (_) {}
                }
            }
        }
    }
};
