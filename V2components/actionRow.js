class ActionRow {
  constructor() {
    this.data = { type: 1, components: [] };
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

  setId(id) {
    this.data.id = id;
    return this;
  }

  toJSON() {
    if (!this.data.components.length) throw new Error('ActionRow must have at least one component');
    return { ...this.data, components: [...this.data.components] };
  }
}

module.exports = { ActionRow };
