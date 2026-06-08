class Section {
  constructor() {
    this.data = { type: 9, components: [] };
  }

  addComponents(...components) {
    const flat = components.flat();
    for (const comp of flat) {
      const json = typeof comp.toJSON === 'function' ? comp.toJSON() : comp;
      if (json.type !== 10) {
        throw new TypeError('Section components must be TextDisplay (type 10) components');
      }
      this.data.components.push(json);
    }
    return this;
  }

  setComponents(...components) {
    this.data.components = [];
    return this.addComponents(...components);
  }

  setAccessory(component) {
    const json = typeof component.toJSON === 'function' ? component.toJSON() : component;
    if (json.type !== 2 && json.type !== 11) {
      throw new TypeError('Section accessory must be a Button (type 2) or Thumbnail (type 11)');
    }
    this.data.accessory = json;
    return this;
  }

  setId(id) {
    this.data.id = id;
    return this;
  }

  toJSON() {
    if (!this.data.components.length) throw new Error('Section requires at least one TextDisplay component');
    return { ...this.data, components: [...this.data.components] };
  }
}

module.exports = { Section };
