import { handleButtonInteraction, handleModalSubmit, handleSelectMenuInteraction } from '../utils/ticketUtils.js';
import { MessageFlags } from 'discord.js';

export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      console.log('Received interaction:', interaction);
      
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        
        if (!command) {
          console.error(`No command matching ${interaction.commandName} was found.`);
          return;
        }
        
        await command.execute(interaction);
      } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
      } else if (interaction.isModalSubmit()) {
        await handleModalSubmit(interaction);
      } else if (interaction.isStringSelectMenu()) {
        await handleSelectMenuInteraction(interaction);
      }
    } catch (error) {
      console.error(error);
      // Only try to respond if the interaction hasn't been handled yet
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'An error occurred while processing the interaction.', flags: MessageFlags.Ephemeral });
        } else {
          await interaction.reply({ content: 'An error occurred while processing the interaction.', flags: MessageFlags.Ephemeral });
        }
      } catch (replyError) {
        console.error('Could not send error response:', replyError.message);
      }
    }
  },
};
