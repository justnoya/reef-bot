const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} = require('@discordjs/voice');
const play  = require('play-dl');
const ytdl  = require('@distube/ytdl-core');

// Reuse a single ytdl agent across all requests (proper cookie/header handling)
const agent = ytdl.createAgent();

class MusicQueue {
  constructor(guildId) {
    this.guildId      = guildId;
    this.tracks       = [];
    this.currentIndex = 0;
    this.connection   = null;
    this.player       = null;
    this.playing      = false;
    this.paused       = false;
    this.loopSong     = false;
    this.loopQueue    = false;
    this.autoplay     = false;
    this.playerMessage = null;
  }

  get current() { return this.tracks[this.currentIndex] || null; }
  get hasNext()  { return this.currentIndex + 1 < this.tracks.length; }
  get hasPrev()  { return this.currentIndex > 0; }
}

class MusicManager {
  constructor() {
    this.queues = new Map();
  }

  getQueue(guildId)    { return this.queues.get(guildId) || null; }
  createQueue(guildId) { const q = new MusicQueue(guildId); this.queues.set(guildId, q); return q; }
  deleteQueue(guildId) { this.queues.delete(guildId); }

  // ── YouTube search via play-dl (search works fine) ──────────────────────────
  async search(query, limit = 5) {
    try {
      const results = await play.search(query, { source: { youtube: 'video' }, limit });
      return results.map(v => ({
        title:      v.title || 'Unknown Title',
        url:        v.url,
        duration:   v.durationRaw || '0:00',
        durationMs: (v.durationInSec || 0) * 1000,
        thumbnail:  v.thumbnails?.[0]?.url || '',
        channel:    v.channel?.name || 'Unknown Artist',
      }));
    } catch { return []; }
  }

  // ── Voice channel join ───────────────────────────────────────────────────────
  async join(voiceChannel, adapterCreator, guildId) {
    const q = this.getQueue(guildId) || this.createQueue(guildId);

    if (q.connection) {
      try { q.connection.destroy(); } catch {}
      q.connection = null;
    }

    const conn = joinVoiceChannel({
      channelId:      voiceChannel.id,
      guildId,
      adapterCreator,
      selfDeaf:       true,
    });

    q.connection = conn;

    // Auto-reconnect on unexpected disconnects
    conn.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(conn, VoiceConnectionStatus.Signalling, 5_000),
          entersState(conn, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        try { conn.destroy(); } catch {}
        this.deleteQueue(guildId);
      }
    });

    // Wait up to 20 s for Ready state
    try {
      await entersState(conn, VoiceConnectionStatus.Ready, 20_000);
    } catch {
      if (conn.state.status === VoiceConnectionStatus.Destroyed) {
        this.deleteQueue(guildId);
        throw new Error('Could not connect to the voice channel — check my permissions.');
      }
      // Not Destroyed yet, proceed optimistically
    }

    return q;
  }

  // ── Stream a track using @distube/ytdl-core (bypasses YouTube bot detection) ─
  async playTrack(q, track, onFinish) {
    if (!q.connection) throw new Error('No active voice connection.');

    // ytdl-core audio-only stream with high watermark to prevent stuttering
    const stream = ytdl(track.url, {
      agent,
      filter:         'audioonly',
      quality:        'highestaudio',
      highWaterMark:  1 << 25,   // 32 MB buffer
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,   // let ffmpeg handle transcoding
    });

    if (!q.player) {
      q.player = createAudioPlayer();
      q.connection.subscribe(q.player);

      q.player.on(AudioPlayerStatus.Idle, () => {
        if (q.loopSong) { this.playTrack(q, q.current, onFinish); return; }
        if (q.loopQueue) { q.currentIndex = (q.currentIndex + 1) % q.tracks.length; }
        else              { q.currentIndex++; }

        if (q.currentIndex < q.tracks.length) {
          this.playTrack(q, q.current, onFinish);
        } else {
          q.playing = false;
          if (onFinish) onFinish(q);
        }
      });

      q.player.on('error', err => {
        console.error('[MusicPlayer error]', err.message);
        q.currentIndex++;
        if (q.currentIndex < q.tracks.length) this.playTrack(q, q.current, onFinish);
        else q.playing = false;
      });
    }

    q.player.play(resource);
    q.playing = true;
    q.paused  = false;
  }

  // ── Playback controls ────────────────────────────────────────────────────────
  pause(guildId) {
    const q = this.getQueue(guildId);
    if (!q?.player) return false;
    if (q.paused) { q.player.unpause(); q.paused = false; }
    else          { q.player.pause();   q.paused = true;  }
    return q.paused;
  }

  skip(guildId) {
    const q = this.getQueue(guildId);
    if (!q?.player) return false;
    q.player.stop();
    return true;
  }

  stop(guildId) {
    const q = this.getQueue(guildId);
    if (!q) return false;
    try { if (q.player)     q.player.stop(true);  } catch {}
    try { if (q.connection) q.connection.destroy(); } catch {}
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
      channelId:      voiceChannel.id,
      guildId:        q.guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf:       true,
    });
    if (q.player) q.connection.subscribe(q.player);
  }
}

module.exports = new MusicManager();
