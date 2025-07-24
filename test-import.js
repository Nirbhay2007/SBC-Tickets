// Test file to check what's causing the hang
console.log('Starting test...');

try {
  console.log('Testing config import...');
  import('./config.js').then(() => {
    console.log('Config imported successfully');
  }).catch(err => {
    console.error('Config import error:', err.message);
  });
} catch (error) {
  console.error('Sync error:', error.message);
}

console.log('Test file completed');
