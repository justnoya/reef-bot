const { ActivityType } = require("discord.js");

module.exports.run = async (client) => {
  client.logger.log(`${client.user.username} is ready with ${client.guilds.cache.size} server(s)`);

  setInterval(() => {
    const statuses = client.config.statuses || ['discord.gg/reefbot'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setActivity(status, { type: ActivityType.Listening });
  }, 60000);

  client.user.setActivity(client.config.statuses?.[0] || 'discord.gg/reefbot', { type: ActivityType.Listening });
};
