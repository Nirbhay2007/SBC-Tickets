import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { setupTicketEmbed } from '../utils/ticketUtils.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup ticket system for a specific category (admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('category')
        .setDescription('The ticket category to setup')
        .setRequired(true)
        .addChoices(
          { name: 'Dungeon', value: 'dungeon' },
          { name: 'Slayer', value: 'slayer' },
          { name: 'Crimson', value: 'crimson' },
          { name: 'Mastermode', value: 'mastermode' },
          { name: 'Support', value: 'support' },
          { name: 'Apply for Guild', value: 'apply-for-guild' },
          { name: 'Apply for Carrier', value: 'apply-for-carrier' },
          { name: 'Apply for Staff', value: 'apply-for-staff' }
        )
    ),
  async execute(interaction) {
    try {
      console.log('Executing setup command');
      
      // Defer reply immediately to prevent timeout
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.followUp({ 
          content: 'You do not have permission to use this command.', 
          flags: MessageFlags.Ephemeral
        });
      }

      const category = interaction.options.getString('category');
      console.log('Requested category:', category);
      
      // Validate category
      const validCategories = ['dungeon', 'slayer', 'crimson', 'mastermode', 'support', 'apply-for-guild', 'apply-for-carrier', 'apply-for-staff'];
      if (!validCategories.includes(category)) {
        return interaction.followUp({
          content: `Invalid category "${category}". Valid categories are: ${validCategories.join(', ')}`,
          flags: MessageFlags.Ephemeral
        });
      }
      
      console.log(`Setting up ticket system for category: ${category}`);
      await setupTicketEmbed(interaction.channel, category);
      console.log('Ticket system setup successfully');
      
      await interaction.followUp({ 
        content: `${category.charAt(0).toUpperCase() + category.slice(1)} ticket system has been set up in this channel.`, 
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('Error while setting up ticket system:', error);
      if (interaction.deferred) {
        await interaction.followUp({ 
          content: 'An error occurred while setting up the ticket system.', 
          flags: MessageFlags.Ephemeral
        });
      } else {
        await interaction.reply({ 
          content: 'An error occurred while setting up the ticket system.', 
          flags: MessageFlags.Ephemeral
        });
      }
    }
  },
};
