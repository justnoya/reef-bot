const { UnfurledMediaItem } = require('./unfurledMediaItem');

class File {
  constructor() {
    this.data = { type: 13 };
  }

  setFile(urlOrItem) {
    this.data.file = UnfurledMediaItem.from(urlOrItem).toJSON();
    return this;
  }

  setURL(url) {
    return this.setFile(url);
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
    if (!this.data.file) throw new Error('File component requires a file (use setFile or setURL)');
    return { ...this.data };
  }
}

module.exports = { File };
