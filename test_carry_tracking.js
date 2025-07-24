import { recordCarryCompletion, getCarrierStats, formatCarrierStats } from './utils/carryTracker.js';

// Test the carry tracking system
console.log('Testing carry tracking system...');

// Test user ID (yours from the logs)
const testUserId = '813062368250298398';
const testUsername = 'nirbhay1103';

// Record some test carries
console.log('Recording test carries...');
recordCarryCompletion(testUserId, 'F6');
recordCarryCompletion(testUserId, 'M4');
recordCarryCompletion(testUserId, 'T4 Eman Bruiser');
recordCarryCompletion(testUserId, 'Crimson Carry');

// Get and display stats
console.log('\nGetting stats...');
const stats = getCarrierStats(testUserId);
console.log('Raw stats:', JSON.stringify(stats, null, 2));

console.log('\nFormatted stats:');
const formatted = formatCarrierStats(testUserId, testUsername);
console.log(formatted);
