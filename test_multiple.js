import { recordCarryCompletion, getCarrierStats } from './utils/carryTracker.js';

console.log('Testing enhanced carry tracking with multiple carries...');

const testUserId = '813062368250298398';

console.log('Before adding multiple carries:');
console.log(JSON.stringify(getCarrierStats(testUserId), null, 2));

console.log('\nAdding 10 F6 carries...');
const result = recordCarryCompletion(testUserId, 'F6', 10);
console.log('Result:', JSON.stringify(result, null, 2));

console.log('\nAdding 5 M4 carries...');
const result2 = recordCarryCompletion(testUserId, 'M4', 5);
console.log('Result:', JSON.stringify(result2, null, 2));
