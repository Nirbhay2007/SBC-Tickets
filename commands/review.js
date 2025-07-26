import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { isStaff } from '../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('Request a review from the customer (use in ticket channels)'),

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

      // Check if this is being used in a ticket channel
      if (!interaction.channel.name.startsWith('ticket-')) {
        await interaction.reply({
          content: '❌ This command can only be used in ticket channels.',
          ephemeral: true
        });
        return;
      }

      // Get the ticket creator from channel name
      const channelName = interaction.channel.name;
      const channelParts = channelName.split('-');
      const customerUsername = channelParts[channelParts.length - 1];

      // Try to find the customer in the channel
      let customer = null;
      const members = await interaction.channel.members;
      if (members) {
        customer = members.find(member => 
          member.user.username.toLowerCase() === customerUsername.toLowerCase() && 
          !member.user.bot
        );
      }

      // If not found in members, try to get from channel permissions
      if (!customer) {
        const permissionOverwrites = interaction.channel.permissionOverwrites.cache;
        for (const [id, overwrite] of permissionOverwrites) {
          if (overwrite.type === 1) { // Type 1 = member
            try {
              const user = await interaction.client.users.fetch(id);
              if (user.username.toLowerCase() === customerUsername.toLowerCase()) {
                customer = user;
                break;
              }
            } catch (err) {
              // Continue searching
            }
          }
        }
      }

      // Check if carrier is trying to review themselves
      if (customer && customer.id === interaction.user.id) {
        await interaction.reply({
          content: '❌ You cannot review yourself! Only customers can submit reviews for carriers.',
          ephemeral: true
        });
        return;
      }

      // Check cooldown for the customer
      if (customer) {
        const { canSubmitReview } = await import('../utils/simpleReviews.js');
        const cooldownCheck = canSubmitReview(customer.id);
        
        if (!cooldownCheck.canSubmit) {
          const hours = Math.floor(cooldownCheck.timeRemaining / 60);
          const minutes = cooldownCheck.timeRemaining % 60;
          const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
          
          await interaction.reply({
            content: `❌ This customer is on cooldown and cannot submit another review for **${timeText}**.\n\n*Reviews are limited to once every 2 hours to prevent spam.*`,
            ephemeral: true
          });
          return;
        }
      }

      // Determine service type from channel name
      let serviceType = 'Carry Service';
      if (channelName.includes('eman') || channelName.includes('bruiser') || channelName.includes('sepulture')) {
        serviceType = 'Slayer Carry';
      } else if (channelName.includes('blaze')) {
        serviceType = 'Blaze Carry';
      } else if (channelName.includes('dungeon') || channelName.includes('f4') || channelName.includes('f5') || channelName.includes('f6') || channelName.includes('f7')) {
        serviceType = 'Dungeon Carry';
      } else if (channelName.includes('mastermode') || channelName.includes('m1') || channelName.includes('m2') || channelName.includes('m3') || channelName.includes('m4') || channelName.includes('m5') || channelName.includes('m6') || channelName.includes('m7')) {
        serviceType = 'Mastermode Carry';
      } else if (channelName.includes('crimson') || channelName.includes('ashfang') || channelName.includes('kuudra')) {
        serviceType = 'Crimson Carry';
      }

      // Create review request embed
      const reviewEmbed = new EmbedBuilder()
        .setTitle('⭐ Rate Your Carry Experience')
        .setDescription(
          `${customer ? customer : `@${customerUsername}`}, how was your **${serviceType}**?\n\n` +
          `Your carrier **${interaction.user.username}** is requesting feedback to improve our services!`
        )
        .setColor('Gold')
        .addFields(
          { name: '🎮 Service', value: serviceType, inline: true },
          { name: '👤 Carrier', value: interaction.user.username, inline: true },
          { name: '📋 Channel', value: channelName.replace('ticket-', ''), inline: true }
        )
        .setFooter({ text: 'SkyBlockC Carry Services - Click a button below to review!' })
        .setTimestamp();

      // Create review buttons with unique IDs
      const timestamp = Date.now();
      const reviewButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`simple-review-excellent-${interaction.user.id}-${customer?.id || 'unknown'}-${timestamp}`)
          .setLabel('⭐⭐⭐⭐⭐ Excellent')
          .setStyle(ButtonStyle.Success)
          .setEmoji('⭐'),
        new ButtonBuilder()
          .setCustomId(`simple-review-good-${interaction.user.id}-${customer?.id || 'unknown'}-${timestamp}`)
          .setLabel('⭐⭐⭐⭐ Good')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('👍'),
        new ButtonBuilder()
          .setCustomId(`simple-review-average-${interaction.user.id}-${customer?.id || 'unknown'}-${timestamp}`)
          .setLabel('⭐⭐⭐ Average')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('👌'),
        new ButtonBuilder()
          .setCustomId(`simple-review-poor-${interaction.user.id}-${customer?.id || 'unknown'}-${timestamp}`)
          .setLabel('⭐⭐ Poor')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('👎')
      );

      // Send the review request
      await interaction.reply({
        embeds: [reviewEmbed],
        components: [reviewButtons]
      });

    } catch (error) {
      console.error('Error in review command:', error);
      await interaction.reply({
        content: '❌ An error occurred while requesting the review.',
        ephemeral: true
      });
    }
  },
};
