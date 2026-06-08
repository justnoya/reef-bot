---
name: ReefBot V2 Components
description: V2components/ folder structure and usage for reef-v3 Discord bot
---

## What was created
`V2components/` directory with 19 files covering all Discord component types.

## Files and types
| File | Type | Notes |
|------|------|-------|
| actionRow.js | 1 | Wraps any component |
| button.js | 2 | ButtonStyle enum |
| stringSelect.js | 3 | + SelectOption class |
| textInput.js | 4 | Modal-only; TextInputStyle enum |
| userSelect.js | 5 | |
| roleSelect.js | 6 | |
| mentionableSelect.js | 7 | |
| channelSelect.js | 8 | + ChannelType enum |
| section.js | 9 | V2 NEW — TextDisplay children + optional Button/Thumbnail accessory |
| textDisplay.js | 10 | V2 NEW — markdown content string |
| thumbnail.js | 11 | V2 NEW — uses UnfurledMediaItem |
| mediaGallery.js | 12 | V2 NEW — + MediaGalleryItem class |
| file.js | 13 | V2 NEW — uses UnfurledMediaItem |
| separator.js | 14 | V2 NEW — SeparatorSpacingSize enum (Small=1, Large=2) |
| container.js | 17 | V2 NEW — exports IS_COMPONENTS_V2 = 1<<15 flag |
| modal.js | — | showModal helper |
| containerModal.js | — | Container+Modal combined pattern |
| unfurledMediaItem.js | — | { url } sub-object |
| index.js | — | barrel export of all |

## Usage pattern
```js
const { Container, TextDisplay, Section, Separator, IS_COMPONENTS_V2 } = require('../V2components');
await message.reply({
  components: [new Container().setAccentColor(0x5865F2).addComponents(...).toJSON()],
  flags: IS_COMPONENTS_V2
});
```

**Why:** Raw JSON builders (not discord.js builders) for version independence. All builders expose method-chaining and `.toJSON()`.
