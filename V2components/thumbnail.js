const { UnfurledMediaItem } = require('./unfurledMediaItem');

class Thumbnail {
  constructor() {
    this.data = { type: 11 };
  }

  setMedia(urlOrItem) {
    this.data.media = UnfurledMediaItem.from(urlOrItem).toJSON();
    return this;
  }

  setURL(url) {
    return this.setMedia(url);
  }

  setDescription(description) {
    this.data.description = description;
    return this;
  }

  setSpoiler(spoiler = true) {
    this.data.spoiler = spoiler;
    return this;
  }

  setId(id) {
    this.data.id = id;
    return this;
  }

  toJSON() {
    if (!this.data.media) throw new Error('Thumbnail requires a media item (use setMedia or setURL)');
    return { ...this.data };
  }
}

module.exports = { Thumbnail };
