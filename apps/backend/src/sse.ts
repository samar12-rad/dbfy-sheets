// Simple SSE Event Emitter for broadcasting sheet updates
import { EventEmitter } from 'events';

class SheetUpdateEmitter extends EventEmitter { }

export const sheetUpdates = new SheetUpdateEmitter();

// Increase max listeners for many concurrent connections
sheetUpdates.setMaxListeners(100);
