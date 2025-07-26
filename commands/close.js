import { SlashCommandBuilder } from 'discord.js';
import { isCoOwner, isOwner } from '../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Force close any ticket (Co-Owner/Owner only)')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The ticket channel to close (leave empty for current channel)')
        .setRequired(false)),

  async execute(interaction) {
    try {
      // Check if user has co-owner or owner permissions
      if (!isCoOwner(interaction.member) && !isOwner(interaction.member)) {
        await interaction.reply({
          content: '❌ **Access Denied** - This command requires Co-Owner or Owner permissions.',
          ephemeral: true
        });
        return;
      }

      const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

      // Check if it's a ticket channel
      if (!targetChannel.name.startsWith('ticket-') && 
          !targetChannel.name.startsWith('application-')) {
        await interaction.reply({
          content: '❌ This is not a ticket channel.',
          ephemeral: true
        });
        return;
      }

      await interaction.reply({
        content: `🔒 Force closing ticket channel: ${targetChannel.name}`,
        ephemeral: true
      });

      // Add a brief delay then delete the channel
      setTimeout(async () => {
        try {
          await targetChannel.delete('Force closed by ' + interaction.user.username);
        } catch (error) {
          console.error('Error force closing ticket:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Error in close command:', error);
      await interaction.reply({
        content: 'An error occurred while force closing the ticket.',
        ephemeral: true
      });
    }
  },
};
