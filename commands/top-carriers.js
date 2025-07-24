import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getTopCarriersThisMonth, getTopCarriersAllTime, getCarrierStats } from '../utils/simpleReviews.js';

export default {
  data: new SlashCommandBuilder()
    .setName('top-carriers')
    .setDescription('View top-rated carriers (Admin only)')
    .addStringOption(option =>
      option.setName('period')
        .setDescription('Time period to view')
        .setRequired(false)
        .addChoices(
          { name: 'This Month', value: 'month' },
          { name: 'All Time', value: 'alltime' }
        ))
    .addUserOption(option =>
      option.setName('carrier')
        .setDescription('View specific carrier stats')
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

    const period = interaction.options.getString('period') || 'month';
    const specificCarrier = interaction.options.getUser('carrier');

    try {
      if (specificCarrier) {
        // Show specific carrier stats
        const stats = getCarrierStats(specificCarrier.id);
        
        if (stats.totalReviews === 0) {
          await interaction.reply({
            content: `📊 **${specificCarrier.username}** has no reviews yet.`,
            ephemeral: true
          });
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle(`📊 Carrier Statistics: ${specificCarrier.username}`)
          .setDescription(`Detailed performance review`)
          .setColor('Blue')
          .setThumbnail(specificCarrier.displayAvatarURL())
          .addFields(
            { name: '📈 Total Reviews', value: stats.totalReviews.toString(), inline: true },
            { name: '⭐ Average Rating', value: `${stats.averageRating}/5.0`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '⭐⭐⭐⭐⭐ Excellent', value: stats.ratings.excellent.toString(), inline: true },
            { name: '⭐⭐⭐⭐ Good', value: stats.ratings.good.toString(), inline: true },
            { name: '⭐⭐⭐ Average', value: stats.ratings.average.toString(), inline: true },
            { name: '⭐⭐ Poor', value: stats.ratings.poor.toString(), inline: true }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      // Show top carriers list
      let topCarriers;
      let title;
      let color;

      if (period === 'month') {
        topCarriers = getTopCarriersThisMonth();
        title = '🏆 Top Carriers This Month';
        color = 'Gold';
      } else {
        topCarriers = getTopCarriersAllTime();
        title = '🏆 Top Carriers All Time';
        color = 'Purple';
      }

      if (topCarriers.length === 0) {
        await interaction.reply({
          content: `📊 No reviews found for ${period === 'month' ? 'this month' : 'all time'}.`,
          ephemeral: true
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription('Based on customer reviews and ratings')
        .setColor(color)
        .setTimestamp();

      // Add top 10 carriers
      const topTen = topCarriers.slice(0, 10);
      let leaderboard = '';

      topTen.forEach((carrier, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const stars = '⭐'.repeat(Math.round(carrier.averageRating));
        leaderboard += `${medal} **${carrier.carrierName}**\n`;
        leaderboard += `   ${stars} ${carrier.averageRating}/5.0 (${carrier.totalReviews} reviews)\n\n`;
      });

      embed.addFields({ name: '🏆 Leaderboard', value: leaderboard || 'No carriers found', inline: false });

      // Add summary stats
      if (topCarriers.length > 0) {
        const totalReviews = topCarriers.reduce((sum, carrier) => sum + carrier.totalReviews, 0);
        const avgRatingOverall = topCarriers.reduce((sum, carrier) => sum + carrier.averageRating, 0) / topCarriers.length;
        
        embed.addFields(
          { name: '📊 Total Reviews', value: totalReviews.toString(), inline: true },
          { name: '👥 Active Carriers', value: topCarriers.length.toString(), inline: true },
          { name: '⭐ Avg Rating', value: avgRatingOverall.toFixed(2), inline: true }
        );
      }

      embed.setFooter({ 
        text: `Use /top-carriers carrier:@username to view specific stats • ${period === 'month' ? 'This Month' : 'All Time'}`
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Error in top-carriers command:', error);
      await interaction.reply({
        content: '❌ An error occurred while fetching carrier statistics.',
        ephemeral: true
      });
    }
  },
};
