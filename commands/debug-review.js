import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('debug-review')
    .setDescription('Debug the review system (Admin only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to test DM capabilities with')
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

    const testUser = interaction.options.getUser('user');

    try {
      // Test if we can send a DM to the user
      await testUser.send('🧪 **Review System Test**\n\nThis is a test message to check if the bot can send you DMs. If you received this, the review system should work!\n\n*You can ignore this message.*');

      await interaction.reply({
        content: `✅ Successfully sent test DM to ${testUser.username}. Review system should work for this user.`,
        ephemeral: true
      });

    } catch (error) {
      let errorMessage = '❌ Failed to send DM. ';
      
      if (error.code === 50007) {
        errorMessage += 'User has DMs disabled from server members.';
      } else if (error.code === 50013) {
        errorMessage += 'Bot lacks permission to send DMs.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }

      // Test fallback by sending in current channel
      try {
        await interaction.channel.send({
          content: `🧪 **Fallback Test for ${testUser}**\n\nThis message simulates what happens when DM delivery fails. The review system would send the review request here instead.\n\n*This is a test of the fallback system.*`
        });

        errorMessage += '\n\n✅ **Fallback test successful** - Review would be sent in ticket channel instead.';
      } catch (fallbackError) {
        errorMessage += '\n\n❌ **Fallback also failed** - Manual staff follow-up would be needed.';
      }

      await interaction.reply({
        content: errorMessage + '\n\n**Solutions:**\n• Enable "Allow direct messages from server members" in server privacy settings\n• Review system will use fallback delivery methods automatically',
        ephemeral: true
      });
    }
  },
};
