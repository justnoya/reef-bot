const TextInputStyle = {
  Short: 1,
  Paragraph: 2
};

class TextInput {
  constructor() {
    this.data = { type: 4 };
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
      const resolved = TextInputStyle[style];
      if (!resolved) throw new TypeError(`Unknown TextInput style: ${style}. Valid: Short, Paragraph`);
      this.data.style = resolved;
    } else {
      this.data.style = style;
    }
    return this;
  }

  setPlaceholder(placeholder) {
    this.data.placeholder = placeholder;
    return this;
  }

  setValue(value) {
    this.data.value = value;
    return this;
  }

  setMinLength(min) {
    this.data.min_length = min;
    return this;
  }

  setMaxLength(max) {
    this.data.max_length = max;
    return this;
  }

  setRequired(required = true) {
    this.data.required = required;
    return this;
  }

  toJSON() {
    if (!this.data.custom_id) throw new Error('TextInput requires a custom_id');
    if (!this.data.label) throw new Error('TextInput requires a label');
    if (!this.data.style) throw new Error('TextInput requires a style');
    return { ...this.data };
  }
}

module.exports = { TextInput, TextInputStyle };
