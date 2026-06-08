class UnfurledMediaItem {
  constructor(url) {
    this.data = { url: '' };
    if (url) this.setURL(url);
  }

  setURL(url) {
    if (typeof url !== 'string' || !url.trim()) throw new TypeError('UnfurledMediaItem url must be a non-empty string');
    this.data.url = url.trim();
    return this;
  }

  toJSON() {
    if (!this.data.url) throw new Error('UnfurledMediaItem requires a url');
    return { url: this.data.url };
  }

  static from(urlOrObject) {
    if (typeof urlOrObject === 'string') return new UnfurledMediaItem(urlOrObject);
    if (urlOrObject instanceof UnfurledMediaItem) return urlOrObject;
    if (urlOrObject?.url) return new UnfurledMediaItem(urlOrObject.url);
    throw new TypeError('UnfurledMediaItem.from() expects a URL string or { url } object');
  }
}

module.exports = { UnfurledMediaItem };
