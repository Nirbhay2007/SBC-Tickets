import { recordCarryCompletion, getCarrierStats, formatCarrierStats } from './utils/carryTracker.js';

console.log('Testing enhanced system with unclaim scenario...');

// Simulate two different carriers
const carrierA = '813062368250298398'; // You
const carrierB = '123456789012345678'; // Another carrier

console.log('=== SCENARIO: 15 Ashfang carries needed ===');

console.log('\n1. Initial state:');
console.log('Carrier A stats:', JSON.stringify(getCarrierStats(carrierA), null, 2));

console.log('\n2. Carrier A does 10 carries and unclaims:');
recordCarryCompletion(carrierA, 'Crimson Carry', 10);
console.log('Carrier A stats after unclaim:', JSON.stringify(getCarrierStats(carrierA), null, 2));

console.log('\n3. Carrier B does remaining 5 carries and closes ticket:');
recordCarryCompletion(carrierB, 'Crimson Carry', 5);
console.log('Carrier B stats after close:', JSON.stringify(getCarrierStats(carrierB), null, 2));

console.log('\n=== FINAL RESULTS ===');
console.log('Carrier A (unclaimed after 10):', formatCarrierStats(carrierA, 'CarrierA'));
console.log('\nCarrier B (closed after 5):', formatCarrierStats(carrierB, 'CarrierB'));
