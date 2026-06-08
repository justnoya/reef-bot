const ButtonStyle = {
  Primary: 1,
  Secondary: 2,
  Success: 3,
  Danger: 4,
  Link: 5,
  Premium: 6
};

class Button {
  constructor() {
    this.data = { type: 2 };
  }

  setCustomId(customId) {
    this.data.custom_id = customId;
    return this;
  }

  setLabel(label) {
    this.data.label = label;
    return this;
  }

  setStyle(style) {
    if (typeof style === 'string') {
      const resolved = ButtonStyle[style];
      if (!resolved) throw new TypeError(`Unknown button style: ${style}. Valid: Primary, Secondary, Success, Danger, Link, Premium`);
      this.data.style = resolved;
    } else {
      this.data.style = style;
    }
    return this;
  }

  setURL(url) {
    this.data.url = url;
    this.data.style = ButtonStyle.Link;
    return this;
  }

  setEmoji(emoji) {
    if (typeof emoji === 'string') {
      const customMatch = emoji.match(/<?a?:?(\w+):(\d+)>?/);
      if (customMatch) {
        this.data.emoji = { name: customMatch[1], id: customMatch[2] };
      } else {
        this.data.emoji = { name: emoji };
      }
    } else {
      this.data.emoji = emoji;
    }
    return this;
  }

  setDisabled(disabled = true) {
    this.data.disabled = disabled;
    return this;
  }

  setSKUId(skuId) {
    this.data.sku_id = skuId;
    this.data.style = ButtonStyle.Premium;
    return this;
  }

  setId(id) {
    this.data.id = id;
    return this;
  }

  toJSON() {
    if (!this.data.style) throw new Error('Button requires a style');
    if (this.data.style === ButtonStyle.Link && !this.data.url) throw new Error('Link-style Button requires a URL');
    if (this.data.style === ButtonStyle.Premium && !this.data.sku_id) throw new Error('Premium-style Button requires a sku_id');
    if (this.data.style !== ButtonStyle.Link && this.data.style !== ButtonStyle.Premium && !this.data.custom_id) {
      throw new Error('Non-link/premium Button requires a custom_id');
    }
    return { ...this.data };
  }
}

module.exports = { Button, ButtonStyle };
