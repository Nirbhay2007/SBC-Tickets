import { SlashCommandBuilder } from 'discord.js';
import { sendReviewRequest } from '../utils/reviewSystem.js';

export default {
  data: new SlashCommandBuilder()
    .setName('test-review')
    .setDescription('Test the review system (Admin only)')
    .addUserOption(option =>
      option.setName('customer')
        .setDescription('The customer to send review to')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('carrier')
        .setDescription('The carrier to review')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('service')
        .setDescription('Type of service provided')
        .setRequired(true)),

  async execute(interaction) {
    // Check if user has admin permissions
    if (!interaction.member.permissions.has('Administrator')) {
      await interaction.reply({
        content: '❌ This command is for administrators only.',
        ephemeral: true
      });
      return;
    }

    const customer = interaction.options.getUser('customer');
    const carrier = interaction.options.getUser('carrier');
    const service = interaction.options.getString('service');

    try {
      const reviewResult = await sendReviewRequest(
        interaction.client,
        customer.id,
        carrier.id,
        carrier.username,
        service,
        `test-${service.toLowerCase()}-${customer.username}`,
        interaction.channel // Pass current channel as fallback
      );

      let responseMessage = '';
      if (reviewResult.success) {
        if (reviewResult.method === 'dm') {
          responseMessage = `✅ Review request sent via DM to ${customer.username} for carrier ${carrier.username}`;
        } else if (reviewResult.method === 'ticket-channel') {
          responseMessage = `📧 Review request sent in channel for ${customer.username} (DM failed: ${reviewResult.dmError})`;
        }
      } else {
        responseMessage = `❌ Review request failed for ${customer.username}: ${reviewResult.reason}`;
        if (reviewResult.dmError) {
          responseMessage += `\n**DM Error:** ${reviewResult.dmError}`;
        }
      }

      await interaction.reply({
        content: responseMessage,
        ephemeral: true
      });

    } catch (error) {
      console.error('Error in test-review command:', error);
      await interaction.reply({
        content: '❌ An error occurred while sending the review request.',
        ephemeral: true
      });
    }
  },
};
