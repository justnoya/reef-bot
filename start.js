'use strict';

if (!global.File) {
  try { global.File = require('buffer').File; } catch (_) {}
}

require('./index.js');
