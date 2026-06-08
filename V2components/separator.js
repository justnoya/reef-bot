const SeparatorSpacingSize = {
  Small: 1,
  Large: 2
};

class Separator {
  constructor() {
    this.data = { type: 14 };
  }

  setDivider(divider = true) {
    this.data.divider = divider;
    return this;
  }

  setSpacing(spacing) {
    if (typeof spacing === 'string') {
      const resolved = SeparatorSpacingSize[spacing];
      if (!resolved) throw new TypeError(`Unknown spacing: ${spacing}. Valid: Small, Large`);
      this.data.spacing = resolved;
    } else {
      this.data.spacing = spacing;
    }
    return this;
  }

  setId(id) {
    this.data.id = id;
    return this;
  }

  toJSON() {
    return { ...this.data };
  }
}

module.exports = { Separator, SeparatorSpacingSize };
