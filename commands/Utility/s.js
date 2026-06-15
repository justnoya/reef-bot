module.exports = {
    name: 's',
    aliases: ['s'],
    cooldown: 3,
    category: 'utility',
    owner: true,
    botPerms: ['ManageWebhooks', 'ViewChannel', 'ManageMessages'],
    userPerms: ['ManageMessages'],
    usage: ['s', 's all'],
    description: 'Stops the loop in this channel. Use `!s all` to stop every loop at once.',
    run: async (client, message, args) => {
        const stopAll = args[0]?.toLowerCase() === 'all';

        if (stopAll) {
            if (client.fuLoops.size === 0) {
                return message.reply({ content: 'No loops are running anywhere.' })
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
            }

            const entries = [...client.fuLoops.entries()];
            client.fuLoops.clear();

            try { await message.delete(); } catch (_) {}

            for (const [channelId, loopData] of entries) {
                loopData.active = false;
                clearInterval(loopData.interval);

                try { await loopData.webhookClient.delete(); } catch (_) {}

                const ch = client.channels.cache.get(channelId);
                if (!ch) continue;

                const { sentIds } = loopData;
                const chunkSize = 100;
                for (let i = 0; i < sentIds.length; i += chunkSize) {
                    const chunk = sentIds.slice(i, i + chunkSize);
                    try {
                        await ch.bulkDelete(chunk, true);
                    } catch (_) {
                        for (const id of chunk) {
                            try {
                                const m = await ch.messages.fetch(id);
                                await m.delete();
                            } catch (_) {}
                        }
                    }
                }
            }
            return;
        }

        // Single channel stop
        const loopData = client.fuLoops.get(message.channel.id);
        if (!loopData) {
            return message.reply({ content: 'No loop is running in this channel.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }

        loopData.active = false;
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
                        const m = await message.channel.messages.fetch(id);
                        await m.delete();
                    } catch (_) {}
                }
            }
        }
    }
};
