const { ActionRow } = require('./actionRow');

class Modal {
  constructor() {
    this.data = { components: [] };
  }

  setTitle(title) {
    this.data.title = title;
    return this;
  }

  setCustomId(customId) {
    this.data.custom_id = customId;
    return this;
  }

  addComponents(...rows) {
    const flat = rows.flat();
    for (const row of flat) {
      const json = typeof row.toJSON === 'function' ? row.toJSON() : row;
      this.data.components.push(json);
    }
    return this;
  }

  setComponents(...rows) {
    this.data.components = [];
    return this.addComponents(...rows);
  }

  addTextInput(textInput) {
    const row = new ActionRow().addComponents(textInput);
    return this.addComponents(row);
  }

  toJSON() {
    if (!this.data.title) throw new Error('Modal requires a title');
    if (!this.data.custom_id) throw new Error('Modal requires a custom_id');
    if (!this.data.components.length) throw new Error('Modal requires at least one component row');
    return { ...this.data, components: [...this.data.components] };
  }

  async showTo(interaction) {
    return interaction.showModal(this.toJSON());
  }
}

module.exports = { Modal };
