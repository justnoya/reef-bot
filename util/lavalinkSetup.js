'use strict';

const { LavalinkManager } = require('lavalink-client');
const { buildPlayerContainer, IS_COMPONENTS_V2 } = require('./musicPlayerUI');

function formatMs(ms) {
  if (!ms || ms <= 0) return '0:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function setupLavalink(client) {
  const host = process.env.LAVALINK_HOST || 'localhost';
  const port = parseInt(process.env.LAVALINK_PORT || '2333', 10);
  const pass = process.env.LAVALINK_PASS || 'youshallnotpass';
  const secure = process.env.LAVALINK_SECURE === 'true';

  const manager = new LavalinkManager({
    nodes: [{
      id: 'main',
      host,
      port,
      authorization: pass,
      secure,
    }],
    sendToShard: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
    client: { id: client.user.id, username: client.user.username },
    playerOptions: {
      defaultSearchPlatform: 'ytsearch',
      onDisconnect: { autoReconnect: true, destroyPlayer: false },
      onEmptyQueue: { destroyAfterMs: 30000 },
    },
  });

  manager.nodeManager.on('error', (node, err) => {
    client.logger.log(`Lavalink [${node?.options?.id || 'main'}] node error: ${err?.message || err}`, 'warn');
  });

  manager.on('nodeConnect', (node) => {
    client.logger.log(`Lavalink node [${node.id}] connected — music ready!`, 'ready');
  });

  manager.on('nodeError', (node, err) => {
    client.logger.log(`Lavalink node [${node.id}] error: ${err?.message || err}`, 'warn');
  });

  manager.on('nodeDisconnect', (node, reason) => {
    client.logger.log(`Lavalink node [${node.id}] disconnected: ${reason?.reason || 'unknown'} — will retry`, 'warn');
  });

  manager.on('nodeReconnect', (node) => {
    client.logger.log(`Lavalink node [${node.id}] reconnecting...`, 'warn');
  });

  manager.on('trackStart', async (player, track) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (!channel) return;
    try {
      if (player._playerMsg) {
        await player._playerMsg.delete().catch(() => {});
        player._playerMsg = null;
      }
      const container = buildPlayerContainer(track, 0xFFFFFF, false);
      const msg = await channel.send({ flags: IS_COMPONENTS_V2, components: [container] });
      player._playerMsg = msg;
    } catch {}
  });

  manager.on('trackEnd', async (player) => {
    if (player._playerMsg) {
      await player._playerMsg.delete().catch(() => {});
      player._playerMsg = null;
    }
  });

  manager.on('queueEnd', async (player) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) channel.send({ content: '✅ Queue finished.' }).catch(() => {});
    if (player._playerMsg) {
      await player._playerMsg.delete().catch(() => {});
      player._playerMsg = null;
    }
  });

  manager.on('playerDisconnect', (player) => {
    if (player._playerMsg) {
      player._playerMsg.delete().catch(() => {});
      player._playerMsg = null;
    }
  });

  return { manager, formatMs };
}

module.exports = { setupLavalink, formatMs };
