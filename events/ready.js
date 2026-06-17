const { ActivityType } = require("discord.js");

module.exports.event = 'clientReady';
module.exports.run = async (client) => {
  client.logger.banner();
  client.logger.log(`${client.user.tag} online · ${client.guilds.cache.size} servers · ${client.ws.ping}ms`, "ready");

  const ownerIds = (client.config.owner || []).filter(x => x && x.trim() !== '');
  const stored   = (await client.db.get('noprefix_users') || []).filter(x => x && x.trim() !== '');
  const merged   = [...new Set([...ownerIds, ...stored])];
  client.noprefix = merged;
  client.logger.log(`NoPrefix loaded for ${merged.length} user(s)`);

  const statuses = client.config.statuses?.length ? client.config.statuses : ['discord.gg/cybork'];
  client.user.setActivity(statuses[0], { type: ActivityType.Watching });

  setInterval(() => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setActivity(status, { type: ActivityType.Watching });
  }, 60000);
};
