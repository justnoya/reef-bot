const ChannelType = {
  GuildText: 0,
  DM: 1,
  GuildVoice: 2,
  GroupDM: 3,
  GuildCategory: 4,
  GuildAnnouncement: 5,
  AnnouncementThread: 10,
  PublicThread: 11,
  PrivateThread: 12,
  GuildStageVoice: 13,
  GuildDirectory: 14,
  GuildForum: 15,
  GuildMedia: 16
};

class ChannelSelect {
  constructor() {
    this.data = { type: 8, default_values: [] };
  }

  setCustomId(customId) {
    this.data.custom_id = customId;
    return this;
  }

  setPlaceholder(placeholder) {
    this.data.placeholder = placeholder;
    return this;
  }

  setMinValues(min) {
    this.data.min_values = min;
    return this;
  }

  setMaxValues(max) {
    this.data.max_values = max;
    return this;
  }

  setDisabled(disabled = true) {
    this.data.disabled = disabled;
    return this;
  }

  addChannelTypes(...types) {
    const flat = types.flat();
    this.data.channel_types = (this.data.channel_types || []).concat(
      flat.map(t => (typeof t === 'string' ? ChannelType[t] ?? t : t))
    );
    return this;
  }

  addDefaultChannels(...channelIds) {
    const flat = channelIds.flat();
    for (const id of flat) this.data.default_values.push({ id, type: 'channel' });
    return this;
  }

  setId(id) {
    this.data.id = id;
    return this;
  }

  toJSON() {
    if (!this.data.custom_id) throw new Error('ChannelSelect requires a custom_id');
    const out = { ...this.data };
    if (!out.default_values.length) delete out.default_values;
    return out;
  }
}

module.exports = { ChannelSelect, ChannelType };
