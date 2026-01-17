import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Review, ReviewStats } from '@/types/reviews';

const REVIEWS_COLLECTION = 'reviews';

// Helper to convert Firestore doc to Review
const docToReview = (docSnap: any): Review => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    providerId: data.providerId,
    patientName: data.patientName,
    patientId: data.patientId,
    userId: data.userId,
    rating: data.rating,
    comment: data.comment,
    visitDate: data.visitDate,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    status: data.status || 'approved',
    helpfulVotes: data.helpfulVotes || 0,
    votedBy: data.votedBy || [],
    providerResponse: data.providerResponse ? {
      text: data.providerResponse.text,
      respondedAt: data.providerResponse.respondedAt?.toDate?.()?.toISOString() || data.providerResponse.respondedAt
    } : undefined
  };
};

// Get all reviews for a provider
export const getReviewsByProvider = async (providerId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('providerId', '==', providerId),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToReview);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

// Get all reviews by a patient (using patientId or userId)
export const getReviewsByPatient = async (patientId: string): Promise<Review[]> => {
  try {
    // Query by userId (Firebase auth ID) which is the reliable field
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('userId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToReview);
  } catch (error) {
    console.error('Error fetching patient reviews:', error);
    return [];
  }
};

// Create a new review
export const createReview = async (
  review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = Timestamp.now();
  
  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
    ...review,
    helpfulVotes: 0,
    votedBy: [],
    status: 'approved', // Auto-approve for now
    createdAt: now,
    updatedAt: now
  });
  
  return docRef.id;
};

// Update a review
export const updateReview = async (
  reviewId: string, 
  updates: Partial<Review>
): Promise<void> => {
  const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

// Vote on a review
export const voteReview = async (reviewId: string, userId: string): Promise<void> => {
  const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
  
  // Use arrayUnion to atomically add the userId and increment votes
  await updateDoc(docRef, {
    votedBy: arrayUnion(userId),
    helpfulVotes: (await getDocs(query(
      collection(db, REVIEWS_COLLECTION),
      where('__name__', '==', reviewId)
    ))).docs[0]?.data()?.helpfulVotes + 1 || 1,
    updatedAt: Timestamp.now()
  });
};

// Add provider response to a review
export const addProviderResponse = async (
  reviewId: string, 
  responseText: string
): Promise<void> => {
  const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
  await updateDoc(docRef, {
    providerResponse: {
      text: responseText,
      respondedAt: Timestamp.now()
    },
    updatedAt: Timestamp.now()
  });
};

// Calculate review stats for a provider
export const getReviewStats = async (providerId: string): Promise<ReviewStats> => {
  const reviews = await getReviewsByProvider(providerId);
  
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
    const rating = Math.min(5, Math.max(1, Math.round(review.rating)));
    distribution[rating as keyof typeof distribution]++;
    totalRating += review.rating;
  });

  return {
    averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
    totalReviews: reviews.length,
    ratingDistribution: distribution
  };
};

// Get all reviews count for platform stats (admin)
export const getAllReviewsCount = async (): Promise<number> => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting reviews:', error);
    return 0;
  }
};
