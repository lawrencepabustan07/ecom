export function calculateReviewMetrics(
  reviews: Array<{
    rating: number;
  }>
) {
  if (reviews.length === 0) {
    return {
      rating: 0,
      reviewCount: 0
    };
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    rating: Number((total / reviews.length).toFixed(1)),
    reviewCount: reviews.length
  };
}
