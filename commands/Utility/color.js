const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

module.exports = {
  name: 'color',
  aliases: ['colour', 'hex'],
  cooldown: 3,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'Show information about a hex color code',
  usage: ['color #RRGGBB'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';
    let hex = args[0].startsWith('#') ? args[0] : `#${args[0]}`;

    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const c = new Container().setAccentColor('#ff0000')
        .addComponents(new TextDisplay('<:error:1425509196773720177> Please provide a valid hex color code. Example: `#FF5733`'));
      return message.channel.send({ components: [c.toJSON()], flags: IS_COMPONENTS_V2 });
    }

    hex = hex.toUpperCase();
    const { r, g, b }    = hexToRgb(hex);
    const { h, s, l }    = rgbToHsl(r, g, b);
    const decimal        = parseInt(hex.slice(1), 16);
    const previewURL     = `https://singlecolorimage.com/get/${hex.slice(1)}/80x80`;

    const container = new Container()
      .setAccentColor(hex)
      .addComponents(
        new TextDisplay(`## 🎨 Color — ${hex}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **HEX:** \`${hex}\`\n` +
          `➜ **RGB:** \`rgb(${r}, ${g}, ${b})\`\n` +
          `➜ **HSL:** \`hsl(${h}°, ${s}%, ${l}%)\`\n` +
          `➜ **Decimal:** \`${decimal}\`\n` +
          `➜ **Integer:** \`0x${hex.slice(1)}\``
        )
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
