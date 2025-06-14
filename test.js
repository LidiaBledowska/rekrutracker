const assert = require('assert');

// Minimal stub for DOM
global.window = {};

const events = {};
const modal = {
  classList: {
    classes: [],
    add(c) { if (!this.classes.includes(c)) this.classes.push(c); },
    remove(c) { this.classes = this.classes.filter(x => x !== c); }
  },
  events: {},
  addEventListener(type, fn) { this.events[type] = fn; },
  removeEventListener(type) { delete this.events[type]; }
};
const img = {};

global.document = {
  events,
  getElementById(id) {
    if (id === 'imageModal') return modal;
    if (id === 'imageModalImg') return img;
    return null;
  },
  addEventListener(type, fn) {
    this.events[type] = fn;
  },
  removeEventListener(type) {
    delete this.events[type];
  }
};

require('./image-modal.js');

assert.strictEqual(typeof window.openImageModal, 'function');
assert.strictEqual(typeof window.closeImageModal, 'function');

window.openImageModal('foo.jpg', 'foo');
assert.strictEqual(img.src, 'foo.jpg');
assert.strictEqual(img.alt, 'foo');
assert.ok(modal.classList.classes.includes('active'));
assert.ok(typeof document.events['keydown'] === 'function');

window.closeImageModal();
assert.ok(!modal.classList.classes.includes('active'));
assert.ok(!('keydown' in document.events));

console.log('All tests passed.');
