const { DisTube } = require('distube');
const ytdl = require('@distube/ytdl-core');
const { buildPlayerContainer, IS_COMPONENTS_V2 } = require('./musicPlayerUI');

const agent = ytdl.createAgent();

function setupDisTube(client) {
  const distube = new DisTube(client, {
    leaveOnEmpty: true,
    emptyCooldown: 25,
    leaveOnFinish: false,
    leaveOnStop: true,
    ytdlOptions: {
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
      agent,
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
    },
  });

  distube.on('playSong', async (queue, song) => {
    const channel = queue.textChannel;
    if (!channel) return;
    try {
      if (queue._playerMsg) {
        await queue._playerMsg.delete().catch(() => {});
        queue._playerMsg = null;
      }
      const container = buildPlayerContainer(song, 0xFFFFFF, false);
      const msg = await channel.send({ flags: IS_COMPONENTS_V2, components: [container] });
      queue._playerMsg = msg;
    } catch (err) {
      console.error('[DisTube playSong]', err.message);
    }
  });

  distube.on('addSong', (queue, song) => {
    if (queue.songs.length <= 1) return;
    queue.textChannel?.send({
      content: `➕ **${song.name}** added to queue — position \`#${queue.songs.length}\``,
    }).catch(() => {});
  });

  distube.on('addList', (queue, playlist) => {
    queue.textChannel?.send({
      content: `➕ Playlist **${playlist.name}** (\`${playlist.songs.length} songs\`) added to queue.`,
    }).catch(() => {});
  });

  distube.on('finish', async (queue) => {
    if (queue._playerMsg) {
      await queue._playerMsg.delete().catch(() => {});
      queue._playerMsg = null;
    }
    queue.textChannel?.send({ content: '✅ Queue finished.' }).catch(() => {});
  });

  distube.on('empty', (queue) => {
    queue.textChannel?.send({ content: '📭 Voice channel is empty — leaving.' }).catch(() => {});
  });

  distube.on('disconnect', (queue) => {
    if (queue._playerMsg) {
      queue._playerMsg.delete().catch(() => {});
      queue._playerMsg = null;
    }
  });

  distube.on('error', (channel, err) => {
    console.error('[DisTube error]', err.message);
    if (channel) channel.send({ content: `❌ Music error: \`${err.message}\`` }).catch(() => {});
  });

  return distube;
}

module.exports = { setupDisTube };
