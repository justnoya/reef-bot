module.exports = {
    name: 's',
    aliases: ['s'],
    cooldown: 3,
    category: 'utility',
    botPerms: ['ManageWebhooks', 'ViewChannel', 'ManageMessages'],
    userPerms: ['ManageMessages'],
    usage: ['s'],
    description: 'Stops the running message loop in this channel and deletes all looped messages.',
    run: async (client, message, args) => {
        if (!client.fuLoops) client.fuLoops = new Map();

        const loopData = client.fuLoops.get(message.channel.id);
        if (!loopData) {
            return message.reply({ content: 'No loop is running in this channel.' }).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }

        clearInterval(loopData.interval);
        client.fuLoops.delete(message.channel.id);

        try { await loopData.webhookClient.delete(); } catch (_) {}

        try { await message.delete(); } catch (_) {}

        const { sentIds } = loopData;
        const chunkSize = 100;
        for (let i = 0; i < sentIds.length; i += chunkSize) {
            const chunk = sentIds.slice(i, i + chunkSize);
            try {
                await message.channel.bulkDelete(chunk, true);
            } catch (_) {
                for (const id of chunk) {
                    try {
                        const msg = await message.channel.messages.fetch(id);
                        await msg.delete();
                    } catch (_) {}
                }
            }
        }
    }
};
