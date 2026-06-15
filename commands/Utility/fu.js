const { WebhookClient } = require('discord.js');

module.exports = {
    name: 'fu',
    aliases: ['fu'],
    cooldown: 5,
    category: 'utility',
    owner: true,
    botPerms: ['ManageWebhooks', 'ViewChannel', 'SendMessages'],
    userPerms: ['ManageMessages'],
    usage: ['fu <message>'],
    description: 'Sends a message in a loop via webhook. Use !s to stop.',
    args: true,
    run: async (client, message, args) => {
        const loopMsg = args.join(' ');
        if (!loopMsg) return message.reply({ content: 'Please provide a message to loop.' });

        if (client.fuLoops.has(message.channel.id)) {
            return message.reply({ content: 'A loop is already running in this channel. Use `!s` to stop it first.' });
        }

        let webhook;
        try {
            webhook = await message.channel.createWebhook({
                name: 'Loop',
                avatar: client.user.displayAvatarURL(),
            });
        } catch (e) {
            return message.reply({ content: 'Failed to create webhook. Make sure I have **Manage Webhooks** permission.' });
        }

        const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });
        const sentIds = [];

        const loopData = {
            webhookClient,
            webhookId: webhook.id,
            sentIds,
            channelId: message.channel.id,
            active: true,
        };

        const sendNext = async () => {
            if (!loopData.active) return;
            try {
                const sent = await webhookClient.send({ content: loopMsg });
                if (sent && sent.id) sentIds.push(sent.id);
            } catch (_) {
                // Silently skip on rate limit or temporary error — loop stays alive
                // Only !s can stop the loop
            }
        };

        loopData.interval = setInterval(sendNext, 300);
        client.fuLoops.set(message.channel.id, loopData);

        // Fire first message immediately
        sendNext();

        try { await message.delete(); } catch (_) {}
    }
};
