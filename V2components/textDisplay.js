class TextDisplay {
  constructor(content) {
    this.data = { type: 10 };
    if (content) this.setContent(content);
  }

  setContent(content) {
    if (typeof content !== 'string') throw new TypeError('TextDisplay content must be a string');
    this.data.content = content;
    return this;
  }

  setId(id) {
    this.data.id = id;
    return this;
  }

  toJSON() {
    if (!this.data.content && this.data.content !== '') throw new Error('TextDisplay requires content');
    return { ...this.data };
  }
}

module.exports = { TextDisplay };
