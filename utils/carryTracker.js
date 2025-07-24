import fs from 'fs';
import path from 'path';

const CARRY_DATA_FILE = path.join(process.cwd(), 'data', 'carryStats.json');

// Ensure data directory exists
function ensureDataDirectory() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

// Load carry statistics from file
export function loadCarryStats() {
    ensureDataDirectory();
    
    if (!fs.existsSync(CARRY_DATA_FILE)) {
        return {};
    }
    
    try {
        const data = fs.readFileSync(CARRY_DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading carry stats:', error);
        return {};
    }
}

// Save carry statistics to file
export function saveCarryStats(stats) {
    ensureDataDirectory();
    
    try {
        fs.writeFileSync(CARRY_DATA_FILE, JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error('Error saving carry stats:', error);
    }
}

// Get carrier's total carries
export function getCarrierStats(userId) {
    const stats = loadCarryStats();
    return stats[userId] || {
        totalCarries: 0,
        // Slayer carries
        t4EmanBruiser: 0,
        t4EmanSepulture: 0,
        t2Blaze: 0,
        t3Blaze: 0,
        t4Blaze: 0,
        // Dungeon carries (F4-F7)
        f4: 0,
        f5: 0,
        f6: 0,
        f7: 0,
        // Mastermode carries (M1-M7)
        m1: 0,
        m2: 0,
        m3: 0,
        m4: 0,
        m5: 0,
        m6: 0,
        m7: 0,
        // Crimson carries
        crimson: 0
    };
}

// Add carries to a carrier's stats
export function addCarriesToStats(userId, ticketType, carriesCompleted = 1) {
    const stats = loadCarryStats();
    
    if (!stats[userId]) {
        stats[userId] = {
            totalCarries: 0,
            // Slayer carries
            t4EmanBruiser: 0,
            t4EmanSepulture: 0,
            t2Blaze: 0,
            t3Blaze: 0,
            t4Blaze: 0,
            // Dungeon carries (F4-F7)
            f4: 0,
            f5: 0,
            f6: 0,
            f7: 0,
            // Mastermode carries (M1-M7)
            m1: 0,
            m2: 0,
            m3: 0,
            m4: 0,
            m5: 0,
            m6: 0,
            m7: 0,
            // Crimson carries
            crimson: 0
        };
    }
    
    // Normalize ticket type to match our stats keys
    const typeMap = {
        // Slayer types
        'T4 Eman Bruiser': 't4EmanBruiser',
        'T4 Eman Sepulture': 't4EmanSepulture',
        'T2 Blaze': 't2Blaze',
        'T3 Blaze': 't3Blaze',
        'T4 Blaze': 't4Blaze',
        // Dungeon types
        'F4': 'f4',
        'F5': 'f5',
        'F6': 'f6',
        'F7': 'f7',
        'Dungeon Carry': 'f4', // Default dungeon to F4 if not specified
        // Mastermode types
        'M1': 'm1',
        'M2': 'm2',
        'M3': 'm3',
        'M4': 'm4',
        'M5': 'm5',
        'M6': 'm6',
        'M7': 'm7',
        'Mastermode Carry': 'm4', // Default mastermode to M4 if not specified
        // Crimson
        'Crimson Carry': 'crimson'
    };
    
    const statKey = typeMap[ticketType];
    if (statKey) {
        stats[userId][statKey] += carriesCompleted;
        stats[userId].totalCarries += carriesCompleted;
    }
    
    saveCarryStats(stats);
    return stats[userId];
}

// Get formatted stats display
export function formatCarrierStats(userId, username) {
    const stats = getCarrierStats(userId);
    
    let display = `**${username}'s Carry Statistics:**\n`;
    display += `🏆 **Total Carries:** ${stats.totalCarries}\n\n`;
    
    // Slayer section
    const slayerTotal = stats.t4EmanBruiser + stats.t4EmanSepulture + stats.t2Blaze + stats.t3Blaze + stats.t4Blaze;
    if (slayerTotal > 0) {
        display += `**�️ Slayer Carries (${slayerTotal}):**\n`;
        if (stats.t4EmanBruiser > 0) display += `<:Voidgloom:1395307387681050645> T4 Eman Bruiser: ${stats.t4EmanBruiser}\n`;
        if (stats.t4EmanSepulture > 0) display += `<:Voidgloom:1395307387681050645> T4 Eman Sepulture: ${stats.t4EmanSepulture}\n`;
        if (stats.t2Blaze > 0) display += `<:Blaze:1395307385281892382> T2 Blaze: ${stats.t2Blaze}\n`;
        if (stats.t3Blaze > 0) display += `<:Blaze:1395307385281892382> T3 Blaze: ${stats.t3Blaze}\n`;
        if (stats.t4Blaze > 0) display += `<:Blaze:1395307385281892382> T4 Blaze: ${stats.t4Blaze}\n`;
        display += '\n';
    }
    
    // Dungeon section
    const dungeonTotal = stats.f4 + stats.f5 + stats.f6 + stats.f7;
    if (dungeonTotal > 0) {
        display += `**🏰 Dungeon Carries (${dungeonTotal}):**\n`;
        if (stats.f4 > 0) display += `<:Thorn:1395307399761403914> F4: ${stats.f4}\n`;
        if (stats.f5 > 0) display += `<:Livid:1395307397131952208> F5: ${stats.f5}\n`;
        if (stats.f6 > 0) display += `<:Sadan:1395307391913947147> F6: ${stats.f6}\n`;
        if (stats.f7 > 0) display += `<:Necron:1395307389820866571> F7: ${stats.f7}\n`;
        display += '\n';
    }
    
    // Mastermode section
    const mastermodeTotal = stats.m1 + stats.m2 + stats.m3 + stats.m4 + stats.m5 + stats.m6 + stats.m7;
    if (mastermodeTotal > 0) {
        display += `**⚡ Mastermode Carries (${mastermodeTotal}):**\n`;
        if (stats.m1 > 0) display += `<:Bonzo:1395307382614028338> M1: ${stats.m1}\n`;
        if (stats.m2 > 0) display += `<:Scarf:1395307393931419669> M2: ${stats.m2}\n`;
        if (stats.m3 > 0) display += `<:professor:1395307400969945098> M3: ${stats.m3}\n`;
        if (stats.m4 > 0) display += `<:Thorn:1395307399761403914> M4: ${stats.m4}\n`;
        if (stats.m5 > 0) display += `<:Livid:1395307397131952208> M5: ${stats.m5}\n`;
        if (stats.m6 > 0) display += `<:Sadan:1395307391913947147> M6: ${stats.m6}\n`;
        if (stats.m7 > 0) display += `<:Necron:1395307389820866571> M7: ${stats.m7}\n`;
        display += '\n';
    }
    
    // Crimson section
    if (stats.crimson > 0) {
        display += `**🔥 Crimson Carries:**\n`;
        display += `<:Crimson:1395307385760874517> Crimson: ${stats.crimson}\n`;
    }
    
    return display;
}

// Get leaderboard of top carriers
export function getCarryLeaderboard(limit = 10) {
    const stats = loadCarryStats();
    
    const leaderboard = Object.entries(stats)
        .map(([userId, userStats]) => ({
            userId,
            totalCarries: userStats.totalCarries
        }))
        .sort((a, b) => b.totalCarries - a.totalCarries)
        .slice(0, limit);
    
    return leaderboard;
}

// Get category-specific leaderboard
export function getCategoryLeaderboard(category, limit = 10) {
    const stats = loadCarryStats();
    
    const categoryMappings = {
        'slayer': ['t4EmanBruiser', 't4EmanSepulture', 't2Blaze', 't3Blaze', 't4Blaze'],
        'voidgloom': ['t4EmanBruiser', 't4EmanSepulture'],
        'blaze': ['t2Blaze', 't3Blaze', 't4Blaze'],
        'dungeon': ['f4', 'f5', 'f6', 'f7'],
        'mastermode': ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
        'crimson': ['crimson'],
        'f4': ['f4'],
        'f5': ['f5'],
        'f6': ['f6'],
        'f7': ['f7'],
        'm1': ['m1'],
        'm2': ['m2'],
        'm3': ['m3'],
        'm4': ['m4'],
        'm5': ['m5'],
        'm6': ['m6'],
        'm7': ['m7']
    };
    
    const categoryKeys = categoryMappings[category.toLowerCase()];
    if (!categoryKeys) {
        return [];
    }
    
    const leaderboard = Object.entries(stats)
        .map(([userId, userStats]) => {
            const categoryTotal = categoryKeys.reduce((total, key) => total + (userStats[key] || 0), 0);
            return {
                userId,
                categoryCarries: categoryTotal,
                breakdown: categoryKeys.reduce((obj, key) => {
                    obj[key] = userStats[key] || 0;
                    return obj;
                }, {})
            };
        })
        .filter(entry => entry.categoryCarries > 0)
        .sort((a, b) => b.categoryCarries - a.categoryCarries)
        .slice(0, limit);
    
    return leaderboard;
}

// Function to record a completed carry
export function recordCarryCompletion(carrierId, ticketType, carriesCompleted = 1) {
    // The ticketType is the carry type, carriesCompleted is the number of carries
    return addCarriesToStats(carrierId, ticketType, carriesCompleted);
}
