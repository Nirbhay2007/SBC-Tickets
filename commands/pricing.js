import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CARRY_PRICES, formatCoins } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pricing')
    .setDescription('View service pricing information')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Filter by service category')
        .setRequired(false)
        .addChoices(
          { name: 'Slayer', value: 'slayer' },
          { name: 'Dungeon', value: 'dungeon' },
          { name: 'Mastermode', value: 'mastermode' },
          { name: 'Crimson', value: 'crimson' }
        )),

  async execute(interaction) {
    try {
      const category = interaction.options.getString('category');
      
      const embed = new EmbedBuilder()
        .setTitle('💰 SBC Pricing Information')
        .setColor('Gold')
        .setTimestamp()
        .setFooter({ text: 'SkyBlockC Carry Services' });

      if (category) {
        // Filter prices by category
        const filteredPrices = getFilteredPrices(category);
        if (filteredPrices.length > 0) {
          embed.setDescription(`**${category.charAt(0).toUpperCase() + category.slice(1)} Services**`);
          filteredPrices.forEach(([service, price]) => {
            embed.addFields({
              name: service,
              value: `💰 ${formatCoins(price)}`,
              inline: true
            });
          });
        } else {
          embed.setDescription(`No pricing found for ${category} category.`);
        }
      } else {
        // Show all pricing
        embed.setDescription('**All Available Services**\n*Use the category option to filter results*');
        
        // Group by categories
        const slayerPrices = getFilteredPrices('slayer');
        const dungeonPrices = getFilteredPrices('dungeon');
        const mastermodePrices = getFilteredPrices('mastermode');
        const crimsonPrices = getFilteredPrices('crimson');
        
        if (slayerPrices.length > 0) {
          embed.addFields({
            name: '🗡️ Slayer Services',
            value: slayerPrices.slice(0, 5).map(([service, price]) => `${service}: ${formatCoins(price)}`).join('\n'),
            inline: false
          });
        }
        
        if (dungeonPrices.length > 0) {
          embed.addFields({
            name: '🏰 Dungeon Services', 
            value: dungeonPrices.slice(0, 5).map(([service, price]) => `${service}: ${formatCoins(price)}`).join('\n'),
            inline: false
          });
        }
        
        if (mastermodePrices.length > 0) {
          embed.addFields({
            name: '👑 Mastermode Services',
            value: mastermodePrices.slice(0, 5).map(([service, price]) => `${service}: ${formatCoins(price)}`).join('\n'),
            inline: false
          });
        }
        
        if (crimsonPrices.length > 0) {
          embed.addFields({
            name: '🔥 Crimson Services',
            value: crimsonPrices.slice(0, 5).map(([service, price]) => `${service}: ${formatCoins(price)}`).join('\n'),
            inline: false
          });
        }
      }

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in pricing command:', error);
      await interaction.reply({
        content: 'An error occurred while fetching pricing information.',
        ephemeral: true
      });
    }
  },
};

function getFilteredPrices(category) {
  const entries = Object.entries(CARRY_PRICES);
  
  switch (category.toLowerCase()) {
    case 'slayer':
      return entries.filter(([service]) => 
        service.includes('Enderman') || service.includes('Blaze') || service.includes('T2') || service.includes('T3') || service.includes('T4')
      );
    case 'dungeon':
      return entries.filter(([service]) => 
        service.includes('F4') || service.includes('F5') || service.includes('F6') || service.includes('F7') || service.includes('Dungeon')
      );
    case 'mastermode':
      return entries.filter(([service]) => 
        service.includes('M1') || service.includes('M2') || service.includes('M3') || service.includes('M4') || 
        service.includes('M5') || service.includes('M6') || service.includes('M7')
      );
    case 'crimson':
      return entries.filter(([service]) => 
        service.includes('Ashfang') || service.includes('Kuudra') || service.includes('Crimson')
      );
    default:
      return entries;
  }
}