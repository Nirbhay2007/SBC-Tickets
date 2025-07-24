// Test script to verify the new review system features
import { saveReview, canSubmitReview } from './utils/simpleReviews.js';

console.log('Testing Enhanced Review System...\n');

// Test 1: Self-review protection
console.log('Test 1: Self-review protection');
const selfReviewData = {
  carrierId: 'user123',
  carrierName: 'TestCarrier',
  customerId: 'user123', // Same as carrier
  customerName: 'TestCarrier',
  rating: 'excellent',
  serviceType: 'Dungeon Carry',
  channelName: 'ticket-f7-testuser',
  guildId: 'guild123'
};

const selfReviewResult = saveReview(selfReviewData);
console.log('Self-review result:', selfReviewResult);
console.log('Expected: { success: false, error: "SELF_REVIEW" }\n');

// Test 2: Valid review
console.log('Test 2: Valid review');
const validReviewData = {
  carrierId: 'carrier456',
  carrierName: 'TestCarrier',
  customerId: 'customer789',
  customerName: 'TestCustomer',
  rating: 'excellent',
  serviceType: 'Dungeon Carry',
  channelName: 'ticket-f7-testcustomer',
  guildId: 'guild123'
};

const validReviewResult = saveReview(validReviewData);
console.log('Valid review result:', validReviewResult);
console.log('Expected: { success: true, review: {...} }\n');

// Test 3: Cooldown check for same customer
console.log('Test 3: Cooldown check');
const cooldownCheck = canSubmitReview('customer789');
console.log('Cooldown check result:', cooldownCheck);
console.log('Expected: { canSubmit: false, timeRemaining: ~120, ... }\n');

// Test 4: Attempt another review during cooldown
console.log('Test 4: Review during cooldown');
const cooldownReviewResult = saveReview(validReviewData);
console.log('Cooldown review result:', cooldownReviewResult);
console.log('Expected: { success: false, error: "COOLDOWN", timeRemaining: ~120 }\n');

console.log('✅ Enhanced Review System Test Complete!');
console.log('\nNew Features:');
console.log('- ❌ Carriers cannot review themselves');
console.log('- ⏰ 2-hour cooldown prevents review spam');
console.log('- 🛡️ Proper error handling with specific messages');
