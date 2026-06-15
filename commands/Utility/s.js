module.exports = {
    name: 's',
    aliases: ['s'],
    cooldown: 3,
    category: 'utility',
    owner: true,
    botPerms: ['Connect', 'ManageChannels'],
    userPerms: ['ViewChannel'],
    usage: ['s'],
    description: 'Force-leaves the locked VC and restores permissions.',
    run: async (client, message) => {
        // Find the locked VC in this guild
        const lockEntry = [...client.vcLocks.entries()]
            .find(([, data]) => data.guildId === message.guild.id);

        if (!lockEntry) {
            return message.reply({ content: 'No voice channel is currently locked in this server.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }

        const [channelId, lockData] = lockEntry;
        client.vcLocks.delete(channelId);

        // Destroy voice connection
        try { lockData.connection.destroy(); } catch (_) {}

        // Restore original @everyone Connect permission
        const vc = message.guild.channels.cache.get(channelId);
        if (vc) {
            const { originalAllow, originalDeny } = lockData;
            const connectValue = originalDeny.includes('Connect')
                ? false
                : originalAllow.includes('Connect')
                    ? true
                    : null;
            try {
                await vc.permissionOverwrites.edit(message.guild.roles.everyone, {
                    Connect: connectValue,
                });
            } catch (_) {}
        }

        try { await message.delete(); } catch (_) {}
    }
};
