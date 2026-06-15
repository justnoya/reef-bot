const { WebhookClient } = require('discord.js');

module.exports = {
    name: 'fu',
    aliases: ['fu'],
    cooldown: 5,
    category: 'utility',
    botPerms: ['ManageWebhooks', 'ViewChannel', 'SendMessages'],
    userPerms: ['ManageMessages'],
    usage: ['fu <message>'],
    description: 'Sends a message in a loop via webhook. Use !s to stop.',
    args: true,
    run: async (client, message, args) => {
        const loopMsg = args.join(' ');
        if (!loopMsg) return message.reply({ content: 'Please provide a message to loop.' });

        if (!client.fuLoops) client.fuLoops = new Map();

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
        };

        const sendNext = async () => {
            try {
                const sent = await webhookClient.send({ content: loopMsg });
                sentIds.push(sent.id);
            } catch (e) {
                clearInterval(loopData.interval);
                client.fuLoops.delete(message.channel.id);
                try { await webhookClient.delete(); } catch (_) {}
            }
        };

        await sendNext();

        loopData.interval = setInterval(sendNext, 1500);
        client.fuLoops.set(message.channel.id, loopData);

        try { await message.delete(); } catch (_) {}
    }
};
