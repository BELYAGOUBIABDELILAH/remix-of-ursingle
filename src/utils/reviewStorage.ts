import { Review, ReviewStats } from '@/types/reviews';

const REVIEWS_KEY = 'cityhealth_reviews';

export const saveReview = (review: Review): void => {
  const reviews = getReviews();
  reviews.push(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
};

export const getReviews = (): Review[] => {
  const stored = localStorage.getItem(REVIEWS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getReviewsByProvider = (providerId: string): Review[] => {
  return getReviews().filter(r => r.providerId === providerId && r.status === 'approved');
};

export const updateReview = (reviewId: string, updates: Partial<Review>): void => {
  const reviews = getReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index !== -1) {
    reviews[index] = { ...reviews[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }
};

export const voteReview = (reviewId: string, userId: string): void => {
  const reviews = getReviews();
  const review = reviews.find(r => r.id === reviewId);
  if (review) {
    if (!review.votedBy.includes(userId)) {
      review.votedBy.push(userId);
      review.helpfulVotes++;
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    }
  }
};

export const getReviewStats = (providerId: string): ReviewStats => {
  const reviews = getReviewsByProvider(providerId);
  
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;

  reviews.forEach(review => {
    distribution[review.rating as keyof typeof distribution]++;
    totalRating += review.rating;
  });

  return {
    averageRating: totalRating / reviews.length,
    totalReviews: reviews.length,
    ratingDistribution: distribution
  };
};
