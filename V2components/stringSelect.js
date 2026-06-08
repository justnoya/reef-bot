class SelectOption {
  constructor() {
    this.data = {};
  }

  setLabel(label) {
    this.data.label = label;
    return this;
  }

  setValue(value) {
    this.data.value = value;
    return this;
  }

  setDescription(description) {
    this.data.description = description;
    return this;
  }

  setEmoji(emoji) {
    if (typeof emoji === 'string') {
      const match = emoji.match(/<?a?:?(\w+):(\d+)>?/);
      this.data.emoji = match ? { name: match[1], id: match[2] } : { name: emoji };
    } else {
      this.data.emoji = emoji;
    }
    return this;
  }

  setDefault(isDefault = true) {
    this.data.default = isDefault;
    return this;
  }

  toJSON() {
    if (!this.data.label) throw new Error('SelectOption requires a label');
    if (!this.data.value) throw new Error('SelectOption requires a value');
    return { ...this.data };
  }
}

class StringSelect {
  constructor() {
    this.data = { type: 3, options: [] };
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

  addOptions(...options) {
    const flat = options.flat();
    for (const opt of flat) {
      this.data.options.push(typeof opt.toJSON === 'function' ? opt.toJSON() : opt);
    }
    return this;
  }

  setOptions(...options) {
    this.data.options = [];
    return this.addOptions(...options);
  }

  setId(id) {
    this.data.id = id;
    return this;
  }

  toJSON() {
    if (!this.data.custom_id) throw new Error('StringSelect requires a custom_id');
    if (!this.data.options.length) throw new Error('StringSelect requires at least one option');
    return { ...this.data, options: [...this.data.options] };
  }
}

module.exports = { StringSelect, SelectOption };
