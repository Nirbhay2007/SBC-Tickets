import { addCarriesToStats } from './utils/carryTracker.js';

console.log('Testing addCarriesToStats directly...');

try {
    console.log('Calling addCarriesToStats...');
    const result = addCarriesToStats('813062368250298398', 'F6', 1);
    console.log('Success! Result:', JSON.stringify(result, null, 2));
} catch (error) {
    console.error('Error calling addCarriesToStats:', error);
    console.error('Stack:', error.stack);
}
