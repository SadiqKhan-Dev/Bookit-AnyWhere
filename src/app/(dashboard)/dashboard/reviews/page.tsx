import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { Metadata } from "next";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { ReviewRespondForm } from "@/components/dashboard/review-respond-form";
import { getProviderReviews } from "@/actions/review";
import { getCurrentUser } from "@/actions/user";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews" };

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default async function DashboardReviewsPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const [user, reviews] = await Promise.all([getCurrentUser(), getProviderReviews()]);
  if (!user) redirect("/sign-in");

  const total = reviews.length;
  const avgRating = total > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
    : 0;
  const unanswered = reviews.filter((r) => !r.response).length;
  const ratingDist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    pct: total > 0 ? (reviews.filter((r) => r.rating === stars).length / total) * 100 : 0,
  }));

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />
      <main className="flex-1 p-8 bg-gray-50">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and respond to customer reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Reviews", value: total, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Average Rating", value: avgRating > 0 ? avgRating.toFixed(1) : "—", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Awaiting Reply", value: unanswered, icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-4`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Star className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-sm text-gray-500">Reviews will appear here once customers complete their bookings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Rating Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-1 h-fit">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Rating Breakdown</h3>
            <div className="text-center mb-4">
              <p className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
              <div className="flex justify-center gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-5 w-5 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">{total} reviews</p>
            </div>
            <div className="space-y-2">
              {ratingDist.map(({ stars, count, pct }) => (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-gray-500 text-right">{stars}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-4 text-gray-400 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review list */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={review.author.imageUrl || ""} />
                      <AvatarFallback>
                        {review.author.firstName?.[0]}{review.author.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {review.author.firstName} {review.author.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRow rating={review.rating} />
                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {review.isVerified && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">Verified</Badge>
                    )}
                    {!review.response && (
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Needs reply</Badge>
                    )}
                  </div>
                </div>

                <div className="mt-3 pl-12">
                  <Link
                    href={`/${review.listing.slug}`}
                    className="text-xs text-rose-500 hover:underline font-medium"
                  >
                    {review.listing.title}
                  </Link>
                  {review.title && (
                    <p className="font-medium text-gray-900 text-sm mt-1">{review.title}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>

                  <ReviewRespondForm
                    reviewId={review.id}
                    existingResponse={review.response}
                    listingSlug={review.listing.slug}
                  />
                </div>

                {reviews.indexOf(review) < reviews.length - 1 && <Separator className="mt-5" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
      </main>
    </div>
  );
}
