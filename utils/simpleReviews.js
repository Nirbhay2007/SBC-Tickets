import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const reviewsFile = path.join(__dirname, '..', 'data', 'reviews.json');

// Ensure data directory exists
const dataDir = path.dirname(reviewsFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize reviews file if it doesn't exist
if (!fs.existsSync(reviewsFile)) {
  fs.writeFileSync(reviewsFile, JSON.stringify({ reviews: [] }, null, 2));
}

// Read reviews from file
export function getReviews() {
  try {
    const data = fs.readFileSync(reviewsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reviews:', error);
    return { reviews: [] };
  }
}

// Check if a customer can submit a review (2-hour cooldown)
export function canSubmitReview(customerId) {
  try {
    const reviews = loadReviews();
    const twoHoursAgo = new Date(Date.now() - (2 * 60 * 60 * 1000)); // 2 hours ago
    
    // Find the most recent review by this customer
    const recentReview = reviews
      .filter(review => review.customerId === customerId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (!recentReview) {
      return { canSubmit: true }; // No previous reviews
    }
    
    const lastReviewTime = new Date(recentReview.timestamp);
    if (lastReviewTime > twoHoursAgo) {
      const timeRemaining = new Date(lastReviewTime.getTime() + (2 * 60 * 60 * 1000));
      const minutesLeft = Math.ceil((timeRemaining - new Date()) / (1000 * 60));
      return {
        canSubmit: false,
        timeRemaining: minutesLeft,
        lastReviewTime: lastReviewTime
      };
    }
    
    return { canSubmit: true };
  } catch (error) {
    console.error('Error checking review cooldown:', error);
    return { canSubmit: true }; // Allow on error to not block legitimate reviews
  }
}

// Save a review to the JSON file
export function saveReview(reviewData) {
  try {
    // Check for self-review
    if (reviewData.carrierId === reviewData.customerId) {
      console.log('Blocked self-review attempt:', reviewData.carrierName);
      return { success: false, error: 'SELF_REVIEW' };
    }
    
    // Check cooldown
    const cooldownCheck = canSubmitReview(reviewData.customerId);
    if (!cooldownCheck.canSubmit) {
      console.log('Review blocked by cooldown:', reviewData.customerName, 'minutes left:', cooldownCheck.timeRemaining);
      return { 
        success: false, 
        error: 'COOLDOWN', 
        timeRemaining: cooldownCheck.timeRemaining 
      };
    }
    
    const reviews = loadReviews();
    
    const newReview = {
      id: Date.now().toString(),
      ...reviewData,
      timestamp: new Date().toISOString(),
      numericRating: getRatingValue(reviewData.rating)
    };
    
    reviews.push(newReview);
    
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
    console.log('Review saved successfully:', newReview);
    return { success: true, review: newReview };
  } catch (error) {
    console.error('Error saving review:', error);
    return { success: false, error: 'SAVE_ERROR' };
  }
}

// Get reviews for a specific carrier
export function getCarrierReviews(carrierId) {
  const data = getReviews();
  return data.reviews.filter(review => review.carrierId === carrierId);
}

// Get carrier statistics
export function getCarrierStats(carrierId) {
  const reviews = getCarrierReviews(carrierId);
  
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratings: { excellent: 0, good: 0, average: 0, poor: 0 }
    };
  }

  const ratings = {
    excellent: reviews.filter(r => r.rating === 'excellent').length,
    good: reviews.filter(r => r.rating === 'good').length,
    average: reviews.filter(r => r.rating === 'average').length,
    poor: reviews.filter(r => r.rating === 'poor').length
  };

  // Calculate average (excellent=5, good=4, average=3, poor=2)
  const totalScore = (ratings.excellent * 5) + (ratings.good * 4) + (ratings.average * 3) + (ratings.poor * 2);
  const averageRating = totalScore / reviews.length;

  return {
    totalReviews: reviews.length,
    averageRating: parseFloat(averageRating.toFixed(2)),
    ratings
  };
}

// Get top carriers for the month
export function getTopCarriersThisMonth() {
  const data = getReviews();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Filter reviews from this month
  const thisMonthReviews = data.reviews.filter(review => {
    const reviewDate = new Date(review.timestamp);
    return reviewDate.getMonth() === currentMonth && reviewDate.getFullYear() === currentYear;
  });

  // Group by carrier
  const carrierStats = {};
  
  thisMonthReviews.forEach(review => {
    if (!carrierStats[review.carrierId]) {
      carrierStats[review.carrierId] = {
        carrierId: review.carrierId,
        carrierName: review.carrierName,
        totalReviews: 0,
        ratings: { excellent: 0, good: 0, average: 0, poor: 0 },
        totalScore: 0
      };
    }

    const stats = carrierStats[review.carrierId];
    stats.totalReviews++;
    stats.ratings[review.rating]++;
    
    // Add score (excellent=5, good=4, average=3, poor=2)
    const scoreMap = { excellent: 5, good: 4, average: 3, poor: 2 };
    stats.totalScore += scoreMap[review.rating];
  });

  // Calculate averages and sort
  const sortedCarriers = Object.values(carrierStats)
    .map(stats => ({
      ...stats,
      averageRating: parseFloat((stats.totalScore / stats.totalReviews).toFixed(2))
    }))
    .sort((a, b) => {
      // First sort by average rating, then by total reviews
      if (b.averageRating === a.averageRating) {
        return b.totalReviews - a.totalReviews;
      }
      return b.averageRating - a.averageRating;
    });

  return sortedCarriers;
}

// Get all-time top carriers
export function getTopCarriersAllTime() {
  const data = getReviews();
  
  // Group by carrier
  const carrierStats = {};
  
  data.reviews.forEach(review => {
    if (!carrierStats[review.carrierId]) {
      carrierStats[review.carrierId] = {
        carrierId: review.carrierId,
        carrierName: review.carrierName,
        totalReviews: 0,
        ratings: { excellent: 0, good: 0, average: 0, poor: 0 },
        totalScore: 0
      };
    }

    const stats = carrierStats[review.carrierId];
    stats.totalReviews++;
    stats.ratings[review.rating]++;
    
    // Add score (excellent=5, good=4, average=3, poor=2)
    const scoreMap = { excellent: 5, good: 4, average: 3, poor: 2 };
    stats.totalScore += scoreMap[review.rating];
  });

  // Calculate averages and sort
  const sortedCarriers = Object.values(carrierStats)
    .map(stats => ({
      ...stats,
      averageRating: parseFloat((stats.totalScore / stats.totalReviews).toFixed(2))
    }))
    .sort((a, b) => {
      // First sort by average rating, then by total reviews
      if (b.averageRating === a.averageRating) {
        return b.totalReviews - a.totalReviews;
      }
      return b.averageRating - a.averageRating;
    });

  return sortedCarriers;
}
