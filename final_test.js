import { recordCarryCompletion, getCarrierStats, formatCarrierStats } from './utils/carryTracker.js';

console.log('Testing the fixed carry tracking system...');

const testUserId = '813062368250298398';
const testUsername = 'nirbhay1103';

console.log('Before adding carries:');
const beforeStats = getCarrierStats(testUserId);
console.log(JSON.stringify(beforeStats, null, 2));

console.log('\nAdding test carries...');
recordCarryCompletion(testUserId, 'F6');
recordCarryCompletion(testUserId, 'M4');
recordCarryCompletion(testUserId, 'T4 Eman Bruiser');

console.log('\nAfter adding carries:');
const afterStats = getCarrierStats(testUserId);
console.log(JSON.stringify(afterStats, null, 2));

console.log('\nFormatted display:');
console.log(formatCarrierStats(testUserId, testUsername));
