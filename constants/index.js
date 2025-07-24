// Application Constants
export const BUTTON_LIMITS = {
  MAX_PER_ROW: 5,
  MAX_ROWS: 5
};

export const TIMEOUTS = {
  CHANNEL_DELETE: 10000,
  INTERACTION_DEFER: 3000,
  COMMAND_COOLDOWN: 30000,
  CARRY_UPDATE_DEBOUNCE: 1000
};

export const EMBED_LIMITS = {
  TITLE_MAX: 256,
  DESCRIPTION_MAX: 4096,
  FIELD_MAX: 1024,
  FOOTER_MAX: 2048,
  FIELDS_MAX: 25
};

export const TICKET_LIMITS = {
  MAX_CARRIES: 50,
  MIN_CATA_LEVEL: {
    F4: 9,
    F5: 14,
    F6: 19,
    F7: 24,
    M1: 19,
    M2: 21,
    M3: 24,
    M4: 27,
    M5: 30,
    M6: 33,
    M7: 36
  },
  MAX_TICKETS_PER_USER: 1
};

export const EMOJIS = {
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  LOADING: '⏳',
  CLAIM: '🔖',
  CLOSE: '🔒',
  UNCLAIM: '🔓',
  FORCE_UNCLAIM: '⚠️',
  QUEUE: '📋',
  PROGRESS: '📊',
  COINS: '💰',
  TIME: '⏰'
};

export const PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};
