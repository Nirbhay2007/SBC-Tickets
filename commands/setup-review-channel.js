import { SlashCommandBuilder, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-review-channel')
    .setDescription('Create a dedicated channel for pending reviews (Admin only)')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name for the review channel')
        .setRequired(false)),

  async execute(interaction) {
    // Check if user has admin permissions
    if (!interaction.member.permissions.has('Administrator')) {
      await interaction.reply({
        content: '❌ This command is for administrators only.',
        ephemeral: true
      });
      return;
    }

    const channelName = interaction.options.getString('name') || 'pending-reviews';

    try {
      // Check if channel already exists
      const existingChannel = interaction.guild.channels.cache.find(ch => ch.name === channelName);
      if (existingChannel) {
        await interaction.reply({
          content: `❌ Channel **${channelName}** already exists: ${existingChannel}`,
          ephemeral: true
        });
        return;
      }

      // Create the review channel
      const reviewChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: 'Pending customer reviews when DMs fail - Staff follow-up needed',
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: ['SendMessages'],
            allow: ['ViewChannel', 'ReadMessageHistory']
          }
          // Staff can send messages by default due to admin permissions
        ]
      });

      // Send initial setup message
      await reviewChannel.send({
        content: '📝 **Pending Reviews Channel**\n\n' +
                 'This channel logs customer reviews that failed to deliver via DM.\n' +
                 '**Staff should follow up with customers manually for their feedback.**\n\n' +
                 '**Common DM failure reasons:**\n' +
                 '• User has "Allow direct messages from server members" disabled\n' +
                 '• User has blocked the bot\n' +
                 '• User left the server\n\n' +
                 '**Setup complete!** 🎉'
      });

      await interaction.reply({
        content: `✅ Review channel created successfully: ${reviewChannel}\n\n` +
                 '**Setup Instructions:**\n' +
                 '1. The bot will automatically log failed review deliveries here\n' +
                 '2. Staff should manually follow up with customers\n' +
                 '3. Consider asking users to enable DMs from server members',
        ephemeral: true
      });

    } catch (error) {
      console.error('Error creating review channel:', error);
      await interaction.reply({
        content: '❌ Failed to create review channel. Please check bot permissions.',
        ephemeral: true
      });
    }
  },
};
