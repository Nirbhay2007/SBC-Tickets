import { TICKET_LIMITS } from '../../constants/index.js';

export const validateCarryInput = (carries) => {
  const num = parseInt(carries);
  if (isNaN(num) || num <= 0 || num > TICKET_LIMITS.MAX_CARRIES) {
    return null;
  }
  return num;
};

export const validateCataLevel = (level, floorType) => {
  const num = parseInt(level);
  const minRequired = TICKET_LIMITS.MIN_CATA_LEVEL[floorType.toUpperCase()];
  
  if (isNaN(num) || !minRequired) {
    return { valid: false, message: 'Invalid catacombs level' };
  }
  
  if (num < minRequired) {
    return { 
      valid: false, 
      message: `Minimum catacombs level for ${floorType} is ${minRequired}` 
    };
  }
  
  return { valid: true, level: num };
};

export const validateUsername = (username) => {
  // Basic Minecraft username validation
  const minecraftRegex = /^[a-zA-Z0-9_]{3,16}$/;
  return minecraftRegex.test(username);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>@#&!]/g, '') // Remove Discord formatting
    .substring(0, 100) // Limit length
    .trim();
};

export const validateDiscordId = (id) => {
  // Discord IDs are 17-19 digit snowflakes
  const discordIdRegex = /^\d{17,19}$/;
  return discordIdRegex.test(id);
};
