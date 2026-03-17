import { Star, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, getRatingLabel } from "@/lib/utils";
import type { Review, User } from "@prisma/client";

interface ReviewListProps {
  listingId: string;
  reviews: (Review & { author: User })[];
  rating: number;
  reviewCount: number;
}

export function ReviewList({ reviews, rating, reviewCount }: ReviewListProps) {
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    pct: reviewCount > 0 ? (reviews.filter((r) => r.rating === stars).length / reviewCount) * 100 : 0,
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Reviews {reviewCount > 0 && `(${reviewCount})`}
      </h2>

      {reviewCount === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Star className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p>No reviews yet. Be the first to leave a review!</p>
        </div>
      ) : (
        <>
          {/* Rating Overview */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Overall */}
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900">{rating.toFixed(1)}</div>
              <div className="flex justify-center gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-5 w-5 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <div className="text-sm font-medium text-gray-500">{getRatingLabel(rating)}</div>
            </div>

            {/* Breakdown */}
            <div className="flex-1 space-y-2">
              {ratingBreakdown.map(({ stars, count, pct }) => (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-right text-gray-500">{stars}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id}>
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.author.imageUrl || ""} />
                    <AvatarFallback>
                      {review.author.firstName?.[0]}{review.author.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {review.author.firstName} {review.author.lastName}
                      </span>
                      {review.isVerified && (
                        <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    {review.title && (
                      <p className="font-medium text-gray-900 text-sm mb-1">{review.title}</p>
                    )}
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>

                    {/* Provider response */}
                    {review.response && (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Response from host</p>
                        <p className="text-sm text-gray-600">{review.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
