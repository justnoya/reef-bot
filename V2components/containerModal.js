const { Container, IS_COMPONENTS_V2 } = require('./container');
const { Section } = require('./section');
const { TextDisplay } = require('./textDisplay');
const { ActionRow } = require('./actionRow');
const { Button } = require('./button');
const { Separator } = require('./separator');
const { Modal } = require('./modal');
const { TextInput } = require('./textInput');

class ContainerModal {
  constructor() {
    this._container = new Container();
    this._modal = new Modal();
    this._triggerButtonCustomId = null;
    this._sections = [];
    this._bottomButtons = [];
  }

  setContainerAccentColor(color) {
    this._container.setAccentColor(color);
    return this;
  }

  setModalTitle(title) {
    this._modal.setTitle(title);
    return this;
  }

  setModalCustomId(customId) {
    this._modal.setCustomId(customId);
    this._triggerButtonCustomId = customId + '_trigger';
    return this;
  }

  setModalTriggerCustomId(customId) {
    this._triggerButtonCustomId = customId;
    return this;
  }

  addHeaderSection(title, description) {
    const components = [];
    if (title) components.push(new TextDisplay(`### ${title}`));
    if (description) components.push(new TextDisplay(description));
    if (components.length) {
      const section = new Section().addComponents(...components);
      this._sections.push({ type: 'section', data: section });
    }
    return this;
  }

  addInfoSection(text, accessory = null) {
    const section = new Section().addComponents(new TextDisplay(text));
    if (accessory) section.setAccessory(accessory);
    this._sections.push({ type: 'section', data: section });
    return this;
  }

  addSeparator(spacing = 'Small') {
    this._sections.push({ type: 'separator', data: new Separator().setSpacing(spacing) });
    return this;
  }

  addModalTextInput(textInput) {
    const row = new ActionRow().addComponents(textInput);
    this._modal.addComponents(row);
    return this;
  }

  addModalField({ customId, label, style = 'Short', placeholder, required = true, minLength, maxLength, value }) {
    const input = new TextInput()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(style)
      .setRequired(required);
    if (placeholder) input.setPlaceholder(placeholder);
    if (minLength !== undefined) input.setMinLength(minLength);
    if (maxLength !== undefined) input.setMaxLength(maxLength);
    if (value !== undefined) input.setValue(value);
    return this.addModalTextInput(input);
  }

  addOpenFormButton(label = 'Open Form', style = 'Primary', emoji = null) {
    const btn = new Button()
      .setLabel(label)
      .setStyle(style)
      .setCustomId(this._triggerButtonCustomId || 'open_modal');
    if (emoji) btn.setEmoji(emoji);
    this._bottomButtons.push(btn);
    return this;
  }

  addBottomButton(button) {
    this._bottomButtons.push(button);
    return this;
  }

  build() {
    const container = new Container().setAccentColor(this._container.data.accent_color || 0x5865F2);

    for (const item of this._sections) {
      container.addComponents(item.data);
    }

    if (this._bottomButtons.length) {
      container.addComponents(new Separator());
      const row = new ActionRow();
      for (const btn of this._bottomButtons) row.addComponents(btn);
      container.addComponents(row);
    }

    return {
      container,
      modal: this._modal,
      triggerCustomId: this._triggerButtonCustomId,
      messagePayload: {
        components: [container.toJSON()],
        flags: IS_COMPONENTS_V2
      },
      handleInteraction: async (interaction) => {
        if (interaction.isButton() && interaction.customId === this._triggerButtonCustomId) {
          await interaction.showModal(this._modal.toJSON());
          return true;
        }
        return false;
      }
    };
  }

  static createSimple({ title, description, fields = [], buttonLabel = 'Submit', accentColor = 0x5865F2, modalCustomId = 'form_modal' }) {
    const cm = new ContainerModal()
      .setContainerAccentColor(accentColor)
      .setModalTitle(title)
      .setModalCustomId(modalCustomId);

    if (description) cm.addHeaderSection(title, description);
    else cm.addHeaderSection(title);

    for (const field of fields) {
      cm.addModalField(field);
    }

    cm.addOpenFormButton(buttonLabel);
    return cm.build();
  }
}

module.exports = { ContainerModal };
