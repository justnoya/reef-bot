const { UnfurledMediaItem } = require('./unfurledMediaItem');

class MediaGalleryItem {
  constructor() {
    this.data = {};
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

  toJSON() {
    if (!this.data.media) throw new Error('MediaGalleryItem requires a media item');
    return { ...this.data };
  }
}

class MediaGallery {
  constructor() {
    this.data = { type: 12, items: [] };
  }

  addItems(...items) {
    const flat = items.flat();
    for (const item of flat) {
      if (typeof item === 'string') {
        this.data.items.push({ media: { url: item } });
      } else if (item instanceof MediaGalleryItem) {
        this.data.items.push(item.toJSON());
      } else if (item?.url) {
        this.data.items.push({ media: { url: item.url }, description: item.description, spoiler: item.spoiler });
      } else if (item?.media) {
        this.data.items.push(typeof item.toJSON === 'function' ? item.toJSON() : item);
      } else {
        throw new TypeError('MediaGallery item must be a URL string, MediaGalleryItem, or { url, description?, spoiler? }');
      }
    }
    return this;
  }

  setItems(...items) {
    this.data.items = [];
    return this.addItems(...items);
  }

  setId(id) {
    this.data.id = id;
    return this;
  }

  toJSON() {
    if (!this.data.items.length) throw new Error('MediaGallery requires at least one item');
    return { ...this.data, items: [...this.data.items] };
  }
}

module.exports = { MediaGallery, MediaGalleryItem };
