"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sheetUpdates = void 0;
// Simple SSE Event Emitter for broadcasting sheet updates
const events_1 = require("events");
class SheetUpdateEmitter extends events_1.EventEmitter {
}
exports.sheetUpdates = new SheetUpdateEmitter();
// Increase max listeners for many concurrent connections
exports.sheetUpdates.setMaxListeners(100);
