import { CARRY_PRICES, formatCoins } from '../config.js';

/**
 * Get the price for a specific service
 * @param {string} serviceType - The type of service (e.g., 'M1', 'Ashfang', 'Basic Kuudra')
 * @param {number} quantity - Number of carries (default: 1)
 * @param {boolean} isBulk - Whether to apply bulk pricing (default: false)
 * @returns {Object} Price information with individual and total prices
 */
export function getServicePrice(serviceType, quantity = 1, isBulk = false) {
  let basePrice = CARRY_PRICES[serviceType] || 0;
  let bulkPrice = CARRY_PRICES[`${serviceType} Bulk`] || basePrice;
  
  // Determine if bulk pricing should apply
  const shouldUseBulk = isBulk || quantity >= getBulkThreshold(serviceType);
  const pricePerUnit = shouldUseBulk ? bulkPrice : basePrice;
  const totalPrice = pricePerUnit * quantity;
  
  return {
    serviceType,
    quantity,
    pricePerUnit,
    totalPrice,
    isBulkPricing: shouldUseBulk,
    formattedPricePerUnit: formatCoins(pricePerUnit),
    formattedTotalPrice: formatCoins(totalPrice),
    bulkThreshold: getBulkThreshold(serviceType)
  };
}

/**
 * Get the bulk threshold for a service type
 * @param {string} serviceType - The service type
 * @returns {number} The minimum quantity for bulk pricing
 */
export function getBulkThreshold(serviceType) {
  // Mastermode bulk threshold is 5+
  if (serviceType.startsWith('M') && serviceType.length <= 2) {
    return 5;
  }
  
  // Crimson bulk threshold is 3+
  if (['Ashfang', 'Basic Kuudra', 'Hot Kuudra', 'Burning Kuudra', 'Fiery Kuudra', 'Infernal Kuudra'].includes(serviceType)) {
    return 3;
  }
  
  // Default no bulk pricing
  return Infinity;
}

/**
 * Get all available services grouped by category
 * @returns {Object} Services grouped by category with pricing info
 */
export function getAllServices() {
  return {
    mastermode: {
      name: '🏰 Mastermode Carries',
      services: [
        { 
          id: 'M1', 
          name: 'Master Mode 1 (S Score)', 
          emoji: '<:Bonzo:1395336254417272944>',
          ...getServicePrice('M1')
        },
        { 
          id: 'M2', 
          name: 'Master Mode 2 (S Score)', 
          emoji: '<:Scarf:1395336330250027089>',
          ...getServicePrice('M2')
        },
        { 
          id: 'M3', 
          name: 'Master Mode 3 (S Score)', 
          emoji: '<:Professor:1374621269252640838>',
          ...getServicePrice('M3')
        },
        { 
          id: 'M4', 
          name: 'Master Mode 4 (Completion)', 
          emoji: '<a:Thorn:1395307380811759737>',
          ...getServicePrice('M4')
        },
        { 
          id: 'M5', 
          name: 'Master Mode 5 (S Score)', 
          emoji: '<:Livid:1395307384418865233>',
          ...getServicePrice('M5')
        },
        { 
          id: 'M6', 
          name: 'Master Mode 6 (S Score)', 
          emoji: '<:Sadan:1395307387224588430>',
          ...getServicePrice('M6')
        },
        { 
          id: 'M7', 
          name: 'Master Mode 7 (S Score)', 
          emoji: '<:Necron:1395307389820866571>',
          ...getServicePrice('M7')
        }
      ]
    },
    crimson: {
      name: '🔥 Crimson Isle Carries',
      services: [
        { 
          id: 'Ashfang', 
          name: 'Ashfang Boss', 
          emoji: '<a:Ashfang:1395290427740913685>',
          ...getServicePrice('Ashfang')
        },
        { 
          id: 'Basic Kuudra', 
          name: 'Basic Kuudra', 
          emoji: '<:basic:1395290441125072967>',
          requirements: 'Have Elle take you to Kuudra',
          ...getServicePrice('Basic Kuudra')
        },
        { 
          id: 'Hot Kuudra', 
          name: 'Hot Kuudra', 
          emoji: '<:hot:1395290436179988621>',
          requirements: '1k Faction Rep, Basic Comp',
          ...getServicePrice('Hot Kuudra')
        },
        { 
          id: 'Burning Kuudra', 
          name: 'Burning Kuudra', 
          emoji: '<:burn:1395290430614274068>',
          requirements: '3k Faction Rep, Hot Comp',
          ...getServicePrice('Burning Kuudra')
        },
        { 
          id: 'Fiery Kuudra', 
          name: 'Fiery Kuudra', 
          emoji: '<:fiery:1395290432988123187>',
          requirements: '7k Faction Rep, Burning Comp',
          ...getServicePrice('Fiery Kuudra')
        },
        { 
          id: 'Infernal Kuudra', 
          name: 'Infernal Kuudra', 
          emoji: '<:infernal:1395290438658687088>',
          requirements: '12k Faction Rep, Fiery Comp',
          ...getServicePrice('Infernal Kuudra')
        }
      ]
    },
    dungeon: {
      name: '🏰 Dungeon Carries',
      services: [
        { 
          id: 'F4 Thorn', 
          name: 'Floor 4 - Thorn', 
          emoji: '<a:Thorn:1395307380811759737>',
          ...getServicePrice('F4 Thorn')
        },
        { 
          id: 'F5 Livid', 
          name: 'Floor 5 - Livid', 
          emoji: '<:Livid:1395307384418865233>',
          ...getServicePrice('F5 Livid')
        },
        { 
          id: 'F6 Sadan', 
          name: 'Floor 6 - Sadan', 
          emoji: '<:Sadan:1395307387224588430>',
          ...getServicePrice('F6 Sadan')
        },
        { 
          id: 'F7 Necron', 
          name: 'Floor 7 - Necron', 
          emoji: '<:Necron:1395307389820866571>',
          ...getServicePrice('F7 Necron')
        }
      ]
    },
    slayer: {
      name: '⚔️ Slayer Carries',
      services: [
        { 
          id: 'T4 Enderman Bruiser', 
          name: 'T4 Enderman Bruiser', 
          emoji: '<:Enderman:1395083334278709440>',
          ...getServicePrice('T4 Enderman Bruiser')
        },
        { 
          id: 'T4 Enderman Sepulture', 
          name: 'T4 Enderman Sepulture', 
          emoji: '<:Enderman:1395083334278709440>',
          ...getServicePrice('T4 Enderman Sepulture')
        },
        { 
          id: 'T2 Blaze', 
          name: 'T2 Blaze', 
          emoji: '<a:Blaze:1395083852195696650>',
          ...getServicePrice('T2 Blaze')
        },
        { 
          id: 'T3 Blaze', 
          name: 'T3 Blaze', 
          emoji: '<a:Blaze:1395083852195696650>',
          ...getServicePrice('T3 Blaze')
        },
        { 
          id: 'T4 Blaze', 
          name: 'T4 Blaze', 
          emoji: '<a:Blaze:1395083852195696650>',
          ...getServicePrice('T4 Blaze')
        }
      ]
    }
  };
}

/**
 * Create a pricing embed for a specific category
 * @param {string} category - The category (mastermode, crimson, dungeon, slayer)
 * @returns {Object} Discord embed with pricing information
 */
export function createPricingEmbed(category) {
  const services = getAllServices()[category.toLowerCase()];
  
  if (!services) {
    throw new Error(`Invalid category: ${category}`);
  }
  
  const embed = {
    title: services.name,
    color: getCategoryColor(category),
    fields: [],
    footer: { text: 'SkyBlockZ Carry Services' }
  };
  
  services.services.forEach(service => {
    let description = `${service.emoji} **${service.formattedPricePerUnit}** per carry`;
    
    if (service.bulkThreshold !== Infinity) {
      const bulkPrice = getServicePrice(service.id, service.bulkThreshold, true);
      description += `\nBulk (${service.bulkThreshold}+): **${bulkPrice.formattedPricePerUnit}** each`;
    }
    
    if (service.requirements) {
      description += `\n*Req: ${service.requirements}*`;
    }
    
    embed.fields.push({
      name: service.name,
      value: description,
      inline: true
    });
  });
  
  return embed;
}

/**
 * Get color for category
 * @param {string} category - The category
 * @returns {string} Color for the category
 */
function getCategoryColor(category) {
  switch (category.toLowerCase()) {
    case 'mastermode':
      return 'Purple';
    case 'crimson':
      return 'Red';
    case 'dungeon':
      return 'Blue';
    case 'slayer':
      return 'Orange';
    default:
      return 'Grey';
  }
}
