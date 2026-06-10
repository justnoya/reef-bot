const { MessageFlags } = require('discord.js');

const IS_COMPONENTS_V2 = MessageFlags.IsComponentsV2;

function buildPlayerContainer(track, accentColor, paused = false) {
  const color = typeof accentColor === 'string'
    ? parseInt(accentColor.replace('#', ''), 16)
    : (accentColor || 0x2f3136);

  return {
    type: 17,
    accent_color: color,
    components: [
      {
        type: 10,
        content: `**🎵 Now Playing**`,
      },
      {
        type: 12,
        items: [
          {
            media: {
              url: track.thumbnail || 'https://i.imgur.com/8ZvgWsD.png',
            },
          },
        ],
      },
      {
        type: 10,
        content: `# ${track.title}\n> \`${track.channel}\`\n> \`${track.duration}\`\n\n`,
      },
      {
        type: 14,
        divider: true,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 2,
            label: '⏮',
            custom_id: 'music_prev',
          },
          {
            type: 2,
            style: paused ? 1 : 2,
            label: paused ? '▶' : '⏸',
            custom_id: 'music_pause',
          },
          {
            type: 2,
            style: 2,
            label: '⏭',
            custom_id: 'music_skip',
          },
          {
            type: 2,
            style: 4,
            label: '⏹',
            custom_id: 'music_stop',
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'music_options',
            placeholder: 'Player Options',
            options: [
              { label: 'Add Songs to Player', value: 'add_songs', emoji: { name: '➕' } },
              { label: 'Lyrics', value: 'lyrics', emoji: { name: '📜' } },
              { label: 'Autoplay', value: 'autoplay', emoji: { name: '🔄' } },
              { label: 'Loop Queue', value: 'loop_queue', emoji: { name: '🔁' } },
              { label: 'Smart Shuffle', value: 'smart_shuffle', emoji: { name: '🔀' } },
              { label: `Radio: ${track.channel}`, value: 'radio', emoji: { name: '📻' } },
              { label: 'Loop Song', value: 'loop_song', emoji: { name: '🔂' } },
              { label: 'Reconnect', value: 'reconnect', emoji: { name: '🔌' } },
              { label: 'Stop', value: 'stop', emoji: { name: '⏹' } },
            ],
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 1,
            label: 'Playlists',
            custom_id: 'music_playlists',
          },
          {
            type: 2,
            style: 1,
            label: 'Browse',
            custom_id: 'music_browse',
          },
          {
            type: 2,
            style: 1,
            label: 'Settings',
            custom_id: 'music_settings',
          },
        ],
      },
    ],
  };
}

function buildSearchResultsContainer(query, results, accentColor) {
  const color = typeof accentColor === 'string'
    ? parseInt(accentColor.replace('#', ''), 16)
    : (accentColor || 0x2f3136);

  const resultLines = results
    .map((r, i) => `\`${String(i + 1).padStart(2, '0')}\` **${r.title}**\n> ${r.channel} · \`${r.duration}\``)
    .join('\n\n');

  return {
    type: 17,
    accent_color: color,
    components: [
      {
        type: 10,
        content: `**🔍 Search Results for: ${query}**\n\n${resultLines}`,
      },
      {
        type: 14,
        divider: true,
        spacing: 1,
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'music_select_result',
            placeholder: '▶  Select a song to play',
            options: results.map((r, i) => ({
              label: r.title.length > 100 ? r.title.slice(0, 97) + '...' : r.title,
              description: `${r.channel} · ${r.duration}`,
              value: `result_${i}`,
            })),
          },
        ],
      },
    ],
  };
}

module.exports = { buildPlayerContainer, buildSearchResultsContainer, IS_COMPONENTS_V2 };
