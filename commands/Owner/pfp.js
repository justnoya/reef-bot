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
    description: "Sets the bot's avatar to the replied image, or the server icon if no reply.",
    run: async (client, message) => {
        let avatarURL = null;
        let source = 'server icon';

        // Check if user replied to a message with an image
        if (message.reference?.messageId) {
            try {
                const replied = await message.channel.messages.fetch(message.reference.messageId);
                const attachment = replied.attachments.find(a =>
                    a.contentType?.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(a.url)
                );
                if (attachment) {
                    avatarURL = attachment.url;
                    source = 'replied image';
                }
                // Also check embeds with images
                if (!avatarURL && replied.embeds.length > 0) {
                    const img = replied.embeds[0]?.image?.url || replied.embeds[0]?.thumbnail?.url;
                    if (img) { avatarURL = img; source = 'replied image'; }
                }
            } catch (_) {}
        }

        // Fallback to server icon
        if (!avatarURL) {
            avatarURL = message.guild.iconURL({ extension: 'png', size: 1024 });
            if (!avatarURL) return;
        }

        let webhook;
        try {
            webhook = await message.channel.createWebhook({
                name: client.user.username,
                avatar: avatarURL,
            });
        } catch (_) { return; }

        const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });

        try { await client.user.setAvatar(avatarURL); } catch (_) {}

        try {
            await webhookClient.send({
                content: `✅ Avatar updated to ${source}.`,
                username: client.user.username,
                avatarURL: avatarURL,
            });
        } catch (_) {}

        try { await webhookClient.delete(); } catch (_) {}
        try { await message.delete(); } catch (_) {}
    }
};
