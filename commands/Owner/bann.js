const { WebhookClient } = require('discord.js');

module.exports = {
    name: 'bann',
    aliases: ['bann'],
    cooldown: 10,
    category: 'owner',
    owner: true,
    botPerms: ['ManageWebhooks', 'ViewChannel', 'SendMessages'],
    userPerms: ['ViewChannel'],
    usage: ['bann'],
    description: "Sets the bot's banner to the replied image, or the server banner if no reply.",
    run: async (client, message) => {
        let bannerURL = null;
        let source = 'server banner';

        // Check if user replied to a message with an image
        if (message.reference?.messageId) {
            try {
                const replied = await message.channel.messages.fetch(message.reference.messageId);
                const attachment = replied.attachments.find(a =>
                    a.contentType?.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(a.url)
                );
                if (attachment) {
                    bannerURL = attachment.url;
                    source = 'replied image';
                }
                if (!bannerURL && replied.embeds.length > 0) {
                    const img = replied.embeds[0]?.image?.url || replied.embeds[0]?.thumbnail?.url;
                    if (img) { bannerURL = img; source = 'replied image'; }
                }
            } catch (_) {}
        }

        // Fallback to server banner
        if (!bannerURL) {
            bannerURL = message.guild.bannerURL({ extension: 'png', size: 1024 });
            if (!bannerURL) {
                return message.reply({ content: 'This server has no banner. Reply to an image to use it as the banner.' })
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
            }
        }

        let webhook;
        try {
            webhook = await message.channel.createWebhook({
                name: client.user.username,
                avatar: client.user.displayAvatarURL(),
            });
        } catch (_) { return; }

        const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });

        try { await client.user.setBanner(bannerURL); } catch (_) {}

        try {
            await webhookClient.send({
                content: `✅ Banner updated to ${source}.`,
                username: client.user.username,
                avatarURL: client.user.displayAvatarURL(),
            });
        } catch (_) {}

        try { await webhookClient.delete(); } catch (_) {}
        try { await message.delete(); } catch (_) {}
    }
};
