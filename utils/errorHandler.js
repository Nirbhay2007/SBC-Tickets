import { EMOJIS } from '../constants/index.js';

export const handleInteractionError = async (interaction, error, context = 'unknown') => {
  console.error(`Error in ${context}:`, error);
  
  const message = `${EMOJIS.ERROR} An error occurred in ${context}. Please try again.`;
  
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: message, ephemeral: true });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  } catch (replyError) {
    console.error('Failed to send error response:', replyError);
  }
};

export const logError = (context, error, metadata = {}) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${context}:`, {
    error: error.message,
    stack: error.stack,
    metadata
  });
};

export const createSafeAsync = (fn, context) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(context, error);
      throw error;
    }
  };
};
