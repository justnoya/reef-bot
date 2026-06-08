class RoleSelect {
  constructor() {
    this.data = { type: 6, default_values: [] };
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

  addDefaultRoles(...roleIds) {
    const flat = roleIds.flat();
    for (const id of flat) {
      this.data.default_values.push({ id, type: 'role' });
    }
    return this;
  }

  setId(id) {
    this.data.id = id;
    return this;
  }

  toJSON() {
    if (!this.data.custom_id) throw new Error('RoleSelect requires a custom_id');
    const out = { ...this.data };
    if (!out.default_values.length) delete out.default_values;
    return out;
  }
}

module.exports = { RoleSelect };
