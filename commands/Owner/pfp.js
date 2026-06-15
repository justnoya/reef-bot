const { WebhookClient } = require('discord.js');

module.exports = {
    name: 'pfp',
    aliases: ['pfp'],
    cooldown: 10,
    category: 'owner',
    owner: true,
    botPerms: ['ManageWebhooks', 'ViewChannel', 'SendMessages'],
    userPerms: ['ViewChannel'],
    usage: ['pfp'],
    description: "Sets the bot's avatar to the server icon via webhook.",
    run: async (client, message) => {
        const iconURL = message.guild.iconURL({ extension: 'png', size: 1024 });
        if (!iconURL) return;

        let webhook;
        try {
            webhook = await message.channel.createWebhook({
                name: client.user.username,
                avatar: iconURL,
            });
        } catch (_) { return; }

        const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });

        try {
            await client.user.setAvatar(iconURL);
        } catch (_) {}

        try {
            await webhookClient.send({
                content: `✅ Avatar updated to server icon.`,
                username: client.user.username,
                avatarURL: iconURL,
            });
        } catch (_) {}

        try { await webhookClient.delete(); } catch (_) {}
        try { await message.delete(); } catch (_) {}
    }
};
