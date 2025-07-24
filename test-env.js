// Minimal test of just imports
console.log('Testing imports...');

import dotenv from 'dotenv';
console.log('dotenv imported');

dotenv.config();
console.log('dotenv configured');

console.log('DISCORD_TOKEN exists:', !!process.env.DISCORD_TOKEN);
console.log('Test complete');
