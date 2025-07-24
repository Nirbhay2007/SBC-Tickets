import { recordCarryCompletion, getCarrierStats } from './utils/carryTracker.js';

console.log('Testing Crimson carry tracking...');

const testUserId = '813062368250298398';

console.log('Before adding crimson carry:');
console.log(JSON.stringify(getCarrierStats(testUserId), null, 2));

console.log('\nAdding Crimson Carry...');
const result = recordCarryCompletion(testUserId, 'Crimson Carry');
console.log('Result:', JSON.stringify(result, null, 2));

console.log('\nAfter adding crimson carry:');
console.log(JSON.stringify(getCarrierStats(testUserId), null, 2));
