import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const STAFF_ROLES = {
  STAFF: process.env.STAFF_ROLE,
  ADMIN: process.env.ADMIN_ROLE,
  MANAGER: process.env.MANAGER_ROLE,
  CO_OWNER: process.env.CO_OWNER_ROLE,
  OWNER: process.env.OWNER_ROLE,
  SBC_CARRIER: process.env.SBC_CARRIER_ROLE
};

export const LOGGING_CONFIG = {
  TICKET_LOGS_CHANNEL: process.env.TICKET_LOGS_CHANNEL,
  VOIDGLOOM_LOGS_CHANNEL: process.env.VOIDGLOOM_LOGS_CHANNEL,
  BLAZE_LOGS_CHANNEL: process.env.BLAZE_LOGS_CHANNEL,
  DUNGEON_LOGS_CHANNEL: process.env.DUNGEON_LOGS_CHANNEL,
  CRIMSON_LOGS_CHANNEL: process.env.CRIMSON_LOGS_CHANNEL,
  MASTERMODE_LOGS_CHANNEL: process.env.MASTERMODE_LOGS_CHANNEL,
};

export const TICKET_CATEGORIES_CONFIG = {
  SLAYER: process.env.SLAYER_CATEGORY,
  DUNGEON: process.env.DUNGEON_CATEGORY,
  MASTERMODE: process.env.MASTERMODE_CATEGORY,
  CRIMSON: process.env.CRIMSON_CATEGORY,
  SUPPORT: process.env.SUPPORT_CATEGORY,
  APPLY_FOR_GUILD: process.env.APPLY_FOR_GUILD_CATEGORY,
  APPLY_FOR_CARRIER: process.env.APPLY_FOR_CARRIER_CATEGORY,
  APPLY_FOR_STAFF: process.env.APPLY_FOR_STAFF_CATEGORY,
};

export const CARRIER_ROLES = {
  // Slayer Carriers
  'T4_EMAN_BRUISER': process.env.T4_EMAN_BRUISER_CARRIER,
  'T4_EMAN_SEPULTURE': process.env.T4_EMAN_SEPULTURE_CARRIER,
  'T2_BLAZE': process.env.T2_BLAZE_CARRIER,
  'T3_BLAZE': process.env.T3_BLAZE_CARRIER,
  'T4_BLAZE': process.env.T4_BLAZE_CARRIER,
  // Dungeon Floor Carriers (F4-F7 only)
  'F4_THORN_CARRIER': process.env.F4_THORN_CARRIER,
  'F5_LIVID_CARRIER': process.env.F5_LIVID_CARRIER,
  'F6_SADAN_CARRIER': process.env.F6_SADAN_CARRIER,
  'F7_NECRON_CARRIER': process.env.F7_NECRON_CARRIER,
  // Mastermode Floor Carriers (M1-M7 only)
  'M1_CARRIER': process.env.M1_CARRIER,
  'M2_CARRIER': process.env.M2_CARRIER,
  'M3_CARRIER': process.env.M3_CARRIER,
  'M4_THORN_CARRIER': process.env.M4_THORN_CARRIER,
  'M5_LIVID_CARRIER': process.env.M5_LIVID_CARRIER,
  'M6_SADAN_CARRIER': process.env.M6_SADAN_CARRIER,
  'M7_NECRON_CARRIER': process.env.M7_NECRON_CARRIER,
  // Crimson Specific Carriers
  'ASHFANG': process.env.ASHFANG_CARRIER,
  'BASIC_KUUDRA': process.env.BASIC_KUUDRA_CARRIER,
  'HOT_KUUDRA': process.env.HOT_KUUDRA_CARRIER,
  'BURNING_KUUDRA': process.env.BURNING_KUUDRA_CARRIER,
  'FIERY_KUUDRA': process.env.FIERY_KUUDRA_CARRIER,
  'INFERNAL_KUUDRA': process.env.INFERNAL_KUUDRA_CARRIER,
};

export const TICKET_CATEGORIES = {
  DUNGEON: 'Dungeon',
  SLAYER: 'Slayer',
  CRIMSON: 'Crimson',
  MASTERMODE: 'Mastermode',
  SUPPORT: 'Support',
  APPLY_FOR_GUILD: 'Apply for Guild',
  APPLY_FOR_CARRIER: 'Apply for Carrier',
  APPLY_FOR_STAFF: 'Apply for Staff',
};

export const CARRY_PRICES = {
  // Slayer Carries (Updated pricing)
  'T4 Enderman Bruiser': 2300000, // 2.3M coins per carry
  'T4 Enderman Bruiser Bulk': 2000000, // 2M coins per carry (10+)
  'T4 Enderman Sepulture': 1600000, // 1.6M coins per carry
  'T4 Enderman Sepulture Bulk': 1400000, // 1.4M coins per carry (10+)
  'T2 Blaze': 1000000, // 1M coins per carry
  'T2 Blaze Bulk': 850000, // 850K coins per carry (10+)
  'T3 Blaze': 2000000, // 2M coins per carry
  'T3 Blaze Bulk': 1500000, // 1.5M coins per carry (10+)
  'T4 Blaze': 5000000, // 5M coins per carry
  'T4 Blaze Bulk': 4000000, // 4M coins per carry (10+)
  
  // Dungeon Carries (Updated pricing)
  'Dungeon': 1000000, // 1M coins per carry (fallback)
  'F4 Thorn Completion': 500000, // 500K coins per carry
  'F4 Thorn S': 700000, // 700K coins per carry
  'F5 Livid Completion': 400000, // 400K coins per carry
  'F5 Livid S': 600000, // 600K coins per carry
  'F5 Livid S+': 750000, // 750K coins per carry
  'F6 Sadan Completion': 650000, // 650K coins per carry
  'F6 Sadan S': 1000000, // 1M coins per carry
  'F6 Sadan S+': 1400000, // 1.4M coins per carry
  'F7 Necron Completion': 5000000, // 5M coins per carry
  'F7 Necron S': 8000000, // 8M coins per carry
  'F7 Necron S+': 11000000, // 11M coins per carry
  
  // Mastermode Carries
  'M1': 1200000, // 1.2M coins per carry (S Score)
  'M2': 2300000, // 2.3M coins per carry (S Score)
  'M3': 3500000, // 3.5M coins per carry (S Score)
  'M4': 14000000, // 14M coins per carry (Completion)
  'M5': 5600000, // 5.6M coins per carry (S Score)
  'M6': 7500000, // 7.5M coins per carry (S Score)
  'M7': 32000000, // 32M coins per carry (S Score)
  // Bulk pricing for Mastermode (5+ carries)
  'M1 Bulk': 1000000, // 1M each for bulk
  'M2 Bulk': 2100000, // 2.1M each for bulk
  'M3 Bulk': 3300000, // 3.3M each for bulk
  'M5 Bulk': 5200000, // 5.2M each for bulk
  'M6 Bulk': 7000000, // 7M each for bulk
  'M7 Bulk': 28000000, // 28M each for bulk
  'Mastermode': 30000000, // 30M coins per carry (fallback)
  
  // Crimson Isle Carries (Updated pricing with bulk tiers)
  'Crimson': 8000000, // 8M coins per carry (fallback)
  'Ashfang': 10000000, // 10M coins per carry
  'Ashfang Bulk': 8000000, // 8M each for bulk (3+)
  'Basic Kuudra': 8000000, // 8M coins per carry
  'Basic Kuudra Bulk': 6000000, // 6M each for bulk (3+)
  'Basic Kuudra Bulk 10+': 5000000, // 5M each for bulk (10+)
  'Hot Kuudra': 12000000, // 12M coins per carry
  'Hot Kuudra Bulk': 10000000, // 10M each for bulk (3+)
  'Hot Kuudra Bulk 10+': 8500000, // 8.5M each for bulk (10+)
  'Burning Kuudra': 14000000, // 14M coins per carry
  'Burning Kuudra Bulk': 11000000, // 11M each for bulk (3+)
  'Burning Kuudra Bulk 10+': 9600000, // 9.6M each for bulk (10+)
  'Fiery Kuudra': 19000000, // 19M coins per carry
  'Fiery Kuudra Bulk': 15000000, // 15M each for bulk (3+)
  'Fiery Kuudra Bulk 10+': 13500000, // 13.5M each for bulk (10+)
  'Infernal Kuudra': 40000000, // 40M coins per carry
  'Infernal Kuudra Bulk': 33000000, // 33M each for bulk (3+)
  'Infernal Kuudra Bulk 10+': 30000000, // 30M each for bulk (10+)
};

// Helper function to format coins
export function formatCoins(amount) {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}
