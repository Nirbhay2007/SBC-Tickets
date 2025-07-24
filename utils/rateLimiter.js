import { TIMEOUTS } from '../constants/index.js';

const userCooldowns = new Map();
const globalCooldowns = new Map();

export const checkCooldown = (userId, action = 'default', cooldownMs = TIMEOUTS.COMMAND_COOLDOWN) => {
  const key = `${userId}-${action}`;
  const now = Date.now();
  const cooldown = userCooldowns.get(key);
  
  if (cooldown && now < cooldown) {
    return Math.ceil((cooldown - now) / 1000);
  }
  
  userCooldowns.set(key, now + cooldownMs);
  return 0;
};

export const checkGlobalCooldown = (action, cooldownMs = 5000) => {
  const now = Date.now();
  const cooldown = globalCooldowns.get(action);
  
  if (cooldown && now < cooldown) {
    return Math.ceil((cooldown - now) / 1000);
  }
  
  globalCooldowns.set(action, now + cooldownMs);
  return 0;
};

export const clearCooldown = (userId, action = 'default') => {
  const key = `${userId}-${action}`;
  userCooldowns.delete(key);
};

export const getRemainingCooldown = (userId, action = 'default') => {
  const key = `${userId}-${action}`;
  const now = Date.now();
  const cooldown = userCooldowns.get(key);
  
  if (!cooldown || now >= cooldown) {
    return 0;
  }
  
  return Math.ceil((cooldown - now) / 1000);
};

// Clean up expired cooldowns every 5 minutes
setInterval(() => {
  const now = Date.now();
  
  for (const [key, expiry] of userCooldowns.entries()) {
    if (now >= expiry) {
      userCooldowns.delete(key);
    }
  }
  
  for (const [key, expiry] of globalCooldowns.entries()) {
    if (now >= expiry) {
      globalCooldowns.delete(key);
    }
  }
}, 5 * 60 * 1000);
