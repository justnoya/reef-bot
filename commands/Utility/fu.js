const { joinVoiceChannel } = require('@discordjs/voice');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'fu',
    aliases: ['fu'],
    cooldown: 5,
    category: 'utility',
    owner: true,
    botPerms: ['Connect', 'MuteMembers', 'ManageChannels'],
    userPerms: ['ViewChannel'],
    usage: ['fu'],
    description: 'Joins your VC and locks it permanently. Use !s to force leave and unlock.',
    run: async (client, message) => {
        const vc = message.member.voice.channel;
        if (!vc) {
            return message.reply({ content: 'You must be in a voice channel.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
        }

        if (client.vcLocks.has(vc.id)) {
            return message.reply({ content: 'That voice channel is already locked. Use `!s` to unlock.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
        }

        // Save original @everyone Connect permission before locking
        const everyoneOverwrite = vc.permissionOverwrites.cache.get(message.guild.id);
        const originalAllow = everyoneOverwrite?.allow.toArray() || [];
        const originalDeny  = everyoneOverwrite?.deny.toArray()  || [];

        // Deny Connect for @everyone
        try {
            await vc.permissionOverwrites.edit(message.guild.roles.everyone, {
                Connect: false,
            });
        } catch (_) {
            return message.reply({ content: 'Failed to lock the channel. Make sure I have **Manage Channels** permission.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
        }

        // Join the VC
        let connection;
        try {
            connection = joinVoiceChannel({
                channelId: vc.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfMute: true,
                selfDeaf: true,
            });
        } catch (_) {
            // Restore perms if join fails
            await vc.permissionOverwrites.edit(message.guild.roles.everyone, {
                Connect: originalDeny.includes('Connect') ? false : (originalAllow.includes('Connect') ? true : null),
            }).catch(() => {});
            return message.reply({ content: 'Failed to join the voice channel.' })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
        }

        client.vcLocks.set(vc.id, {
            connection,
            channelId: vc.id,
            guildId: message.guild.id,
            originalAllow,
            originalDeny,
        });

        try { await message.delete(); } catch (_) {}
    }
};
