import { addCarriesToStats, getCarrierStats, loadCarryStats, saveCarryStats } from './utils/carryTracker.js';

console.log('Testing carry tracking system step by step...');

const testUserId = '813062368250298398';

console.log('1. Loading current stats:');
const currentStats = loadCarryStats();
console.log(JSON.stringify(currentStats, null, 2));

console.log('\n2. Testing addCarriesToStats with F6:');
try {
    const result = addCarriesToStats(testUserId, 'F6', 1);
    console.log('F6 result:', JSON.stringify(result, null, 2));
} catch (error) {
    console.error('Error with F6:', error);
}

console.log('\n3. Loading stats after F6:');
const afterF6 = loadCarryStats();
console.log(JSON.stringify(afterF6, null, 2));

console.log('\n4. Testing addCarriesToStats with M4:');
try {
    const result = addCarriesToStats(testUserId, 'M4', 1);
    console.log('M4 result:', JSON.stringify(result, null, 2));
} catch (error) {
    console.error('Error with M4:', error);
}

console.log('\n5. Final check - loading stats:');
const finalStats = loadCarryStats();
console.log(JSON.stringify(finalStats, null, 2));
