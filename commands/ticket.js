import { SlashCommandBuilder } from 'discord.js';
import { reopenTicket, getTicketStats } from '../utils/ticketUtils.js';
import { isStaff } from '../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('reopen')
        .setDescription('Reopen a closed ticket')
        .addStringOption(option =>
          option.setName('ticket-id').setDescription('The ID of the ticket to reopen').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('Get ticket stats')
    ),
  async execute(interaction) {
    try {
      // Check if user has staff permissions
      if (!isStaff(interaction.member)) {
        await interaction.reply({
          content: '❌ **Access Denied** - This command requires staff permissions or higher.',
          ephemeral: true
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'reopen') {
        const ticketId = interaction.options.getString('ticket-id');
        await reopenTicket(ticketId, interaction);
      } else if (subcommand === 'stats') {
        const stats = await getTicketStats();
        interaction.reply({ content: stats, ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while managing tickets.', ephemeral: true });
    }
  },
};
