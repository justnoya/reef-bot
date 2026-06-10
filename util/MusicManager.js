const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} = require('@discordjs/voice');
const play = require('play-dl');

class MusicQueue {
  constructor(guildId) {
    this.guildId = guildId;
    this.tracks = [];
    this.currentIndex = 0;
    this.connection = null;
    this.player = null;
    this.playing = false;
    this.paused = false;
    this.loopSong = false;
    this.loopQueue = false;
    this.autoplay = false;
    this.playerMessage = null;
  }

  get current() {
    return this.tracks[this.currentIndex] || null;
  }

  get hasNext() {
    return this.currentIndex + 1 < this.tracks.length;
  }

  get hasPrev() {
    return this.currentIndex > 0;
  }
}

class MusicManager {
  constructor() {
    this.queues = new Map();
  }

  getQueue(guildId) {
    return this.queues.get(guildId) || null;
  }

  createQueue(guildId) {
    const q = new MusicQueue(guildId);
    this.queues.set(guildId, q);
    return q;
  }

  deleteQueue(guildId) {
    this.queues.delete(guildId);
  }

  async search(query, limit = 5) {
    try {
      const results = await play.search(query, { source: { youtube: 'video' }, limit });
      return results.map(v => ({
        title: v.title || 'Unknown Title',
        url: v.url,
        duration: v.durationRaw || '0:00',
        durationMs: (v.durationInSec || 0) * 1000,
        thumbnail: v.thumbnails?.[0]?.url || '',
        channel: v.channel?.name || 'Unknown Artist',
      }));
    } catch (e) {
      return [];
    }
  }

  async join(voiceChannel, adapterCreator, guildId) {
    const q = this.getQueue(guildId) || this.createQueue(guildId);
    if (q.connection) {
      try { q.connection.destroy(); } catch {}
    }
    q.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator,
      selfDeaf: true,
    });
    try {
      await entersState(q.connection, VoiceConnectionStatus.Ready, 10_000);
    } catch {
      q.connection.destroy();
      this.deleteQueue(guildId);
      throw new Error('Could not join voice channel.');
    }
    return q;
  }

  async playTrack(q, track, onFinish) {
    try {
      const source = await play.stream(track.url, { quality: 0 });
      const resource = createAudioResource(source.stream, {
        inputType: source.type,
      });

      if (!q.player) {
        q.player = createAudioPlayer();
        q.connection.subscribe(q.player);

        q.player.on(AudioPlayerStatus.Idle, () => {
          if (q.loopSong) {
            this.playTrack(q, q.current, onFinish);
            return;
          }
          if (q.loopQueue) {
            q.currentIndex = (q.currentIndex + 1) % q.tracks.length;
          } else {
            q.currentIndex++;
          }
          if (q.currentIndex < q.tracks.length) {
            this.playTrack(q, q.current, onFinish);
          } else {
            q.playing = false;
            if (onFinish) onFinish(q);
          }
        });

        q.player.on('error', () => {
          q.currentIndex++;
          if (q.currentIndex < q.tracks.length) {
            this.playTrack(q, q.current, onFinish);
          } else {
            q.playing = false;
          }
        });
      }

      q.player.play(resource);
      q.playing = true;
      q.paused = false;
    } catch (e) {
      throw e;
    }
  }

  pause(guildId) {
    const q = this.getQueue(guildId);
    if (!q || !q.player) return false;
    if (q.paused) {
      q.player.unpause();
      q.paused = false;
    } else {
      q.player.pause();
      q.paused = true;
    }
    return q.paused;
  }

  skip(guildId) {
    const q = this.getQueue(guildId);
    if (!q || !q.player) return false;
    q.player.stop();
    return true;
  }

  stop(guildId) {
    const q = this.getQueue(guildId);
    if (!q) return false;
    try {
      if (q.player) q.player.stop(true);
      if (q.connection) q.connection.destroy();
    } catch {}
    this.deleteQueue(guildId);
    return true;
  }

  prev(guildId) {
    const q = this.getQueue(guildId);
    if (!q || q.currentIndex <= 0) return false;
    q.currentIndex -= 2;
    if (q.player) q.player.stop();
    return true;
  }

  reconnect(q, voiceChannel) {
    if (!q) return;
    try { q.connection.destroy(); } catch {}
    q.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: q.guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: true,
    });
    if (q.player) q.connection.subscribe(q.player);
  }
}

module.exports = new MusicManager();
