class Container {
  constructor() {
    this.data = { type: 17, components: [] };
  }

  addComponents(...components) {
    const flat = components.flat();
    for (const comp of flat) {
      const json = typeof comp.toJSON === 'function' ? comp.toJSON() : comp;
      this.data.components.push(json);
    }
    return this;
  }

  setComponents(...components) {
    this.data.components = [];
    return this.addComponents(...components);
  }

  setAccentColor(color) {
    if (typeof color === 'string') {
      const hex = color.replace('#', '');
      this.data.accent_color = parseInt(hex, 16);
    } else {
      this.data.accent_color = color;
    }
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
    if (!this.data.components.length) throw new Error('Container requires at least one component');
    return { ...this.data, components: [...this.data.components] };
  }
}

const IS_COMPONENTS_V2 = 1 << 15;

module.exports = { Container, IS_COMPONENTS_V2 };
