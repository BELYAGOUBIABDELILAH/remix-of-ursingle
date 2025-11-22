import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Review, ReviewStats } from '@/types/reviews';
import { getReviewsByProvider, saveReview, voteReview, updateReview, getReviewStats } from '@/utils/reviewStorage';

interface ReviewSystemProps {
  providerId: string;
  providerName: string;
  canReview?: boolean;
  isProvider?: boolean;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  providerId,
  providerName,
  canReview = false,
  isProvider = false,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [patientName, setPatientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  useEffect(() => {
    loadReviews();
  }, [providerId]);

  const loadReviews = () => {
    const providerReviews = getReviewsByProvider(providerId);
    setReviews(providerReviews);
    setStats(getReviewStats(providerId));
  };

  const submitReview = () => {
    if (!rating || !comment.trim() || !patientName.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    const newReview: Review = {
      id: crypto.randomUUID(),
      providerId,
      patientName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'approved',
      helpfulVotes: 0,
      votedBy: [],
    };

    saveReview(newReview);
    loadReviews();

    toast.success('Votre avis a été publié avec succès!');
    setRating(0);
    setComment('');
    setPatientName('');
    setShowForm(false);
    setIsSubmitting(false);
  };

  const handleVoteHelpful = (reviewId: string) => {
    const userId = 'current-user';
    voteReview(reviewId, userId);
    loadReviews();
    toast.success('Merci pour votre retour!');
  };

  const submitResponse = (reviewId: string) => {
    const text = responseText[reviewId];
    
    if (!text?.trim()) {
      toast.error('Veuillez entrer une réponse');
      return;
    }

    updateReview(reviewId, {
      providerResponse: {
        text,
        respondedAt: new Date().toISOString(),
      },
    });

    loadReviews();
    setResponseText({ ...responseText, [reviewId]: '' });
    toast.success('Votre réponse a été publiée!');
  };

  if (!stats) return null;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Avis des patients
          </CardTitle>
          {canReview && !showForm && (
            <Button onClick={() => setShowForm(true)} size="sm">
              Laisser un avis
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="flex flex-col md:flex-row gap-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-center md:border-r md:pr-6">
            <div className="text-5xl font-bold text-primary">{stats.averageRating.toFixed(1)}</div>
            <div className="flex gap-0.5 mt-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(stats.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Basé sur {stats.totalReviews} avis
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((ratingLevel) => (
              <div key={ratingLevel} className="flex items-center gap-3 text-sm">
                <span className="w-12 flex items-center gap-1">
                  {ratingLevel} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </span>
                <Progress
                  value={stats.totalReviews > 0 ? (stats.ratingDistribution[ratingLevel as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 : 0}
                  className="flex-1 h-2"
                />
                <span className="w-12 text-muted-foreground text-right">
                  {stats.ratingDistribution[ratingLevel as keyof typeof stats.ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form */}
        {canReview && showForm && (
          <>
            <Separator />
            <div className="space-y-4 p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold">Laisser un avis pour {providerName}</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Votre nom</label>
                <Input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nom complet"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Votre note</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Votre commentaire</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={submitReview} disabled={isSubmitting}>
                  <Send className="h-4 w-4 mr-2" />
                  Publier l'avis
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Reviews List */}
        <Separator />
        
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Aucun avis pour le moment. Soyez le premier à partager votre expérience!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div key={review.id}>
                {idx > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  {/* Review Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {review.patientName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{review.patientName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.status === 'approved' && (
                      <Badge variant="secondary" className="shrink-0">
                        Vérifié
                      </Badge>
                    )}
                  </div>

                  {/* Review Content */}
                  <p className="text-sm leading-relaxed pl-12">{review.comment}</p>

                  {/* Helpful Button */}
                  <div className="flex items-center gap-3 pl-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVoteHelpful(review.id)}
                      disabled={review.votedBy.includes('current-user')}
                      className="h-8"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Utile ({review.helpfulVotes})
                    </Button>
                  </div>

                  {/* Provider Response */}
                  {review.providerResponse && (
                    <div className="pl-12 mt-4">
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10">
                            Réponse du praticien
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.providerResponse.respondedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm">{review.providerResponse.text}</p>
                      </div>
                    </div>
                  )}

                  {/* Provider Response Form */}
                  {isProvider && !review.providerResponse && (
                    <div className="pl-12 mt-4 space-y-2">
                      <Textarea
                        value={responseText[review.id] || ''}
                        onChange={(e) => setResponseText({ ...responseText, [review.id]: e.target.value })}
                        placeholder="Répondre à cet avis..."
                        rows={3}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => submitResponse(review.id)}
                        disabled={!responseText[review.id]?.trim()}
                      >
                        <Send className="h-3 w-3 mr-2" />
                        Envoyer la réponse
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
