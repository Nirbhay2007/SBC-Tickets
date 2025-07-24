import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

// Send review request to ticket creator with fallback options
export async function sendReviewRequest(client, ticketCreatorId, carrierUserId, carrierUsername, ticketType, channelName, ticketChannel = null) {
  try {
    // Get the ticket creator user
    const ticketCreator = await client.users.fetch(ticketCreatorId);
    if (!ticketCreator) {
      console.log('Could not fetch ticket creator for review system');
      return { success: false, method: 'failed', reason: 'User not found' };
    }

    // Create review request embed
    const reviewEmbed = new EmbedBuilder()
      .setTitle('📝 Rate Your Carry Experience')
      .setDescription(
        `Hey ${ticketCreator.username}! Your **${ticketType}** carry has been completed.\n\n` +
        `Please take a moment to review your carrier **${carrierUsername}** to help us improve our services.`
      )
      .setColor('Gold')
      .addFields(
        { name: '🎮 Service Type', value: ticketType, inline: true },
        { name: '👤 Your Carrier', value: carrierUsername, inline: true },
        { name: '📋 Ticket', value: channelName.replace('ticket-', ''), inline: true }
      )
      .setFooter({ text: 'SkyBlockC Carry Services - We value your feedback!' })
      .setTimestamp();

    // Create review buttons
    const reviewButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`review-good-${carrierUserId}-${ticketCreatorId}-${Date.now()}`)
        .setLabel('👍 Good Experience')
        .setStyle(ButtonStyle.Success)
        .setEmoji('👍'),
      new ButtonBuilder()
        .setCustomId(`review-bad-${carrierUserId}-${ticketCreatorId}-${Date.now()}`)
        .setLabel('👎 Bad Experience')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('👎')
    );

    // Try DM first
    try {
      await ticketCreator.send({
        embeds: [reviewEmbed],
        components: [reviewButtons]
      });
      console.log(`✅ Review request sent via DM to ${ticketCreator.username} for carrier ${carrierUsername}`);
      return { success: true, method: 'dm', reason: 'Successfully sent via DM' };
    } catch (dmError) {
      console.error(`❌ Could not send DM to ${ticketCreator.username}:`, dmError.message);
      console.log(`Error code: ${dmError.code}, Error details:`, dmError);
      
      if (dmError.code === 50007) {
        console.log(`❌ User ${ticketCreator.username} has DMs disabled from server members`);
      } else if (dmError.code === 50013) {
        console.log(`❌ Bot lacks permission to send DMs to ${ticketCreator.username}`);
      }
      
      // DM failed - try fallback methods
      console.log(`🔄 Attempting fallback methods for ${ticketCreator.username}...`);
      return await handleReviewFallback(client, ticketCreator, reviewEmbed, reviewButtons, ticketChannel, carrierUsername, dmError);
    }

  } catch (error) {
    console.error('Error sending review request:', error);
    return { success: false, method: 'failed', reason: error.message };
  }
}

// Handle fallback methods when DM fails
async function handleReviewFallback(client, ticketCreator, reviewEmbed, reviewButtons, ticketChannel, carrierUsername, dmError) {
  let fallbackSuccess = false;
  let fallbackMethod = 'none';
  let fallbackReason = 'No fallback attempted';

  try {
    // Method 1: Send in ticket channel before it gets deleted (if channel is provided)
    if (ticketChannel && !ticketChannel.deleted) {
      try {
        // Update embed to mention it's a fallback
        const fallbackEmbed = EmbedBuilder.from(reviewEmbed)
          .setDescription(
            `${ticketCreator}, your **${reviewEmbed.data.fields[0].value}** carry has been completed.\n\n` +
            `**We couldn't send you a DM**, so please review your carrier **${carrierUsername}** here:\n` +
            `💡 *Enable "Allow direct messages from server members" in server privacy settings for future reviews*`
          )
          .setColor('Orange');

        await ticketChannel.send({
          content: `${ticketCreator} - Please review your carry before this channel closes!`,
          embeds: [fallbackEmbed],
          components: [reviewButtons]
        });

        console.log(`✅ Review request sent in ticket channel for ${ticketCreator.username}`);
        fallbackSuccess = true;
        fallbackMethod = 'ticket-channel';
        fallbackReason = 'Sent in ticket channel before deletion';
      } catch (channelError) {
        console.error(`❌ Failed to send review in ticket channel:`, channelError.message);
      }
    }

    // Method 2: Send to dedicated review channel
    const guild = ticketChannel?.guild || client.guilds.cache.first();
    if (guild) {
      const reviewChannel = guild.channels.cache.find(ch => 
        ch.name === 'pending-reviews' || 
        ch.name === 'customer-reviews' ||
        ch.name === 'reviews'
      );

      if (reviewChannel) {
        try {
          const pendingEmbed = new EmbedBuilder()
            .setTitle('📝 Pending Customer Review')
            .setDescription(
              `**Customer:** ${ticketCreator.username} (${ticketCreator})\n` +
              `**Carrier:** ${carrierUsername}\n` +
              `**Service:** ${reviewEmbed.data.fields[0].value}\n\n` +
              `❌ **DM Failed:** ${getDMFailureReason(dmError)}\n` +
              `${fallbackSuccess ? '✅ **Backup sent in ticket channel**' : '❌ **No backup delivery possible**'}\n\n` +
              `**Staff Action Needed:** Please follow up with ${ticketCreator.username} for their review.`
            )
            .setColor('Yellow')
            .addFields(
              { name: '📋 Original Ticket', value: reviewEmbed.data.fields[2].value, inline: true },
              { name: '⏰ Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
              { name: '📞 Contact Method', value: fallbackSuccess ? 'Via ticket channel' : 'Manual follow-up needed', inline: true }
            )
            .setFooter({ text: 'Review System - DM Delivery Failed' })
            .setTimestamp();

          await reviewChannel.send({
            embeds: [pendingEmbed]
          });

          console.log(`✅ Pending review logged to ${reviewChannel.name} for ${ticketCreator.username}`);
        } catch (reviewChannelError) {
          console.error(`❌ Failed to send to review channel:`, reviewChannelError.message);
        }
      }
    }

    return { 
      success: fallbackSuccess, 
      method: fallbackMethod, 
      reason: fallbackReason,
      dmError: getDMFailureReason(dmError)
    };

  } catch (error) {
    console.error('Error in review fallback:', error);
    return { 
      success: false, 
      method: 'failed', 
      reason: `Fallback failed: ${error.message}`,
      dmError: getDMFailureReason(dmError)
    };
  }
}

// Get human-readable DM failure reason
function getDMFailureReason(dmError) {
  if (dmError.code === 50007) {
    return 'User has DMs disabled from server members';
  } else if (dmError.code === 50013) {
    return 'Bot lacks permission to send DMs';
  } else {
    return `Unknown error: ${dmError.message}`;
  }
}

// Handle review button interactions
export async function handleReviewButtonInteraction(interaction) {
  try {
    const customId = interaction.customId;
    const isGoodReview = customId.startsWith('review-good');
    const parts = customId.split('-');
    const reviewType = parts[1]; // 'good' or 'bad'
    const carrierUserId = parts[2];
    const reviewerUserId = parts[3];
    const timestamp = parts[4];

    // Verify the user clicking is the original reviewer
    if (interaction.user.id !== reviewerUserId) {
      await interaction.reply({
        content: '❌ You can only submit reviews for your own carry experiences.',
        ephemeral: true
      });
      return;
    }

    // Create review modal based on review type
    const modal = createReviewModal(reviewType, carrierUserId, reviewerUserId, timestamp);
    await interaction.showModal(modal);

  } catch (error) {
    console.error('Error handling review button interaction:', error);
    await interaction.reply({
      content: '❌ An error occurred while processing your review.',
      ephemeral: true
    });
  }
}

// Create review modal for detailed feedback
function createReviewModal(reviewType, carrierUserId, reviewerUserId, timestamp) {
  const isGoodReview = reviewType === 'good';
  
  const modal = new ModalBuilder()
    .setCustomId(`review-modal-${reviewType}-${carrierUserId}-${reviewerUserId}-${timestamp}`)
    .setTitle(isGoodReview ? '👍 Positive Review' : '👎 Negative Review');

  let questions = [];

  if (isGoodReview) {
    questions = [
      {
        id: 'positive_aspects',
        label: 'What did you like about your carrier?',
        placeholder: 'e.g., Fast service, friendly, helpful, professional...',
        style: TextInputStyle.Paragraph,
        required: true,
        maxLength: 1000
      },
      {
        id: 'recommendation',
        label: 'Would you recommend this carrier to others?',
        placeholder: 'Yes/No and why?',
        style: TextInputStyle.Short,
        required: true,
        maxLength: 200
      },
      {
        id: 'overall_rating',
        label: 'Overall Rating (1-5 stars)',
        placeholder: 'Enter a number from 1 to 5',
        style: TextInputStyle.Short,
        required: true,
        maxLength: 1
      },
      {
        id: 'additional_comments',
        label: 'Additional Comments (Optional)',
        placeholder: 'Any other feedback you\'d like to share...',
        style: TextInputStyle.Paragraph,
        required: false,
        maxLength: 500
      }
    ];
  } else {
    questions = [
      {
        id: 'negative_aspects',
        label: 'What didn\'t you like about your carrier?',
        placeholder: 'Please describe what went wrong or could be improved...',
        style: TextInputStyle.Paragraph,
        required: true,
        maxLength: 1000
      },
      {
        id: 'specific_issues',
        label: 'Specific Issues Encountered',
        placeholder: 'e.g., Slow response, unprofessional, didn\'t complete carry...',
        style: TextInputStyle.Paragraph,
        required: true,
        maxLength: 500
      },
      {
        id: 'severity',
        label: 'How severe was the issue? (1-5)',
        placeholder: '1 = Minor issue, 5 = Major problem',
        style: TextInputStyle.Short,
        required: true,
        maxLength: 1
      },
      {
        id: 'suggestions',
        label: 'Suggestions for Improvement (Optional)',
        placeholder: 'How could this carrier improve their service?',
        style: TextInputStyle.Paragraph,
        required: false,
        maxLength: 500
      }
    ];
  }

  const components = questions.map(question => {
    const textInput = new TextInputBuilder()
      .setCustomId(question.id)
      .setLabel(question.label)
      .setStyle(question.style)
      .setPlaceholder(question.placeholder)
      .setRequired(question.required);

    if (question.maxLength) {
      textInput.setMaxLength(question.maxLength);
    }

    return new ActionRowBuilder().addComponents(textInput);
  });

  modal.addComponents(...components);
  return modal;
}

// Handle review modal submission
export async function handleReviewModalSubmission(interaction) {
  try {
    const customId = interaction.customId;
    const parts = customId.split('-');
    const reviewType = parts[2]; // 'good' or 'bad'
    const carrierUserId = parts[3];
    const reviewerUserId = parts[4];
    const timestamp = parts[5];

    // Collect review data
    const reviewData = {};
    interaction.fields.fields.forEach((field, key) => {
      reviewData[key] = field.value;
    });

    const isGoodReview = reviewType === 'good';

    // Get user objects
    const carrier = await interaction.client.users.fetch(carrierUserId);
    const reviewer = interaction.user;

    // Create review summary embed
    const reviewEmbed = new EmbedBuilder()
      .setTitle(isGoodReview ? '👍 Positive Review Received' : '👎 Negative Review Received')
      .setDescription(`**${reviewer.username}** has left a review for **${carrier.username}**`)
      .setColor(isGoodReview ? 'Green' : 'Red')
      .setTimestamp()
      .setFooter({ text: `Review ID: ${timestamp}` });

    // Add review fields based on type
    if (isGoodReview) {
      reviewEmbed.addFields(
        { name: '✨ What They Liked', value: reviewData.positive_aspects || 'No comment', inline: false },
        { name: '🤝 Would Recommend?', value: reviewData.recommendation || 'No comment', inline: true },
        { name: '⭐ Overall Rating', value: `${reviewData.overall_rating}/5 stars` || 'Not rated', inline: true },
        { name: '📝 Additional Comments', value: reviewData.additional_comments || 'None', inline: false }
      );
    } else {
      reviewEmbed.addFields(
        { name: '❌ Issues Encountered', value: reviewData.negative_aspects || 'No comment', inline: false },
        { name: '🚨 Specific Problems', value: reviewData.specific_issues || 'No comment', inline: false },
        { name: '📊 Severity Level', value: `${reviewData.severity}/5` || 'Not rated', inline: true },
        { name: '💡 Suggestions', value: reviewData.suggestions || 'None provided', inline: false }
      );
    }

    // Add reviewer and carrier info
    reviewEmbed.addFields(
      { name: '👤 Reviewer', value: `${reviewer.username} (${reviewer.id})`, inline: true },
      { name: '🎯 Carrier', value: `${carrier.username} (${carrier.id})`, inline: true },
      { name: '📅 Review Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
    );

    // Find the review logging channel (try to find a reviews/feedback channel)
    const guild = interaction.client.guilds.cache.first(); // Assuming single guild
    const reviewLogChannel = guild.channels.cache.find(ch => 
      ch.name.includes('review') || ch.name.includes('feedback') || ch.name.includes('logs')
    );

    if (reviewLogChannel) {
      await reviewLogChannel.send({ embeds: [reviewEmbed] });
    }

    // Send confirmation to reviewer
    await interaction.reply({
      content: isGoodReview 
        ? '✅ Thank you for your positive review! Your feedback helps us maintain quality service.'
        : '✅ Thank you for your feedback. We take all concerns seriously and will address this with the carrier.',
      ephemeral: true
    });

    // Disable the review buttons in the original DM
    const disabledButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('review-completed')
        .setLabel('✅ Review Submitted')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    try {
      await interaction.message.edit({
        embeds: interaction.message.embeds,
        components: [disabledButtons]
      });
    } catch (editError) {
      console.log('Could not edit original review message - might be in DM');
    }

    // Notify carrier about the review (only for positive reviews to avoid harassment)
    if (isGoodReview) {
      try {
        const carrierNotificationEmbed = new EmbedBuilder()
          .setTitle('⭐ You Received a Positive Review!')
          .setDescription(`**${reviewer.username}** left you a positive review for your carry service!`)
          .setColor('Green')
          .addFields(
            { name: '👍 What they liked', value: reviewData.positive_aspects.substring(0, 500) + (reviewData.positive_aspects.length > 500 ? '...' : ''), inline: false },
            { name: '⭐ Rating', value: `${reviewData.overall_rating}/5 stars`, inline: true }
          )
          .setFooter({ text: 'Keep up the great work! 🎉' })
          .setTimestamp();

        await carrier.send({ embeds: [carrierNotificationEmbed] });
      } catch (carrierDmError) {
        console.log(`Could not notify carrier ${carrier.username} about positive review`);
      }
    }

    // If it's a negative review, notify staff in the logging channel
    if (!isGoodReview && reviewLogChannel) {
      await reviewLogChannel.send({
        content: `🚨 **Staff Alert** - Negative review requires attention`,
        embeds: [reviewEmbed]
      });
    }

    console.log(`${isGoodReview ? 'Positive' : 'Negative'} review submitted by ${reviewer.username} for carrier ${carrier.username}`);

  } catch (error) {
    console.error('Error handling review modal submission:', error);
    await interaction.reply({
      content: '❌ An error occurred while submitting your review. Please try again.',
      ephemeral: true
    });
  }
}
