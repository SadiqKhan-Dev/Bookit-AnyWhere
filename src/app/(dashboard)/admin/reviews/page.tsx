import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ReviewDeleteBtn } from "@/components/admin/review-delete-btn";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/actions/user";
import { getAdminReviews } from "@/actions/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Reviews" };

interface Props {
  searchParams: { page?: string };
}

const typeColors: Record<string, string> = {
  SALON: "bg-pink-100 text-pink-700",
  HOTEL: "bg-blue-100 text-blue-700",
  MEDICAL: "bg-emerald-100 text-emerald-700",
  AIRPORT: "bg-sky-100 text-sky-700",
  FLIGHT: "bg-violet-100 text-violet-700",
  CRUISE: "bg-teal-100 text-teal-700",
};

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const { reviews, total, pages } = await getAdminReviews(page, 20);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
            <p className="text-sm text-gray-500 mt-1">{total} total reviews</p>
          </div>

          {/* Reviews */}
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Star className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-sm text-gray-500">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        {review.author.imageUrl ? (
                          <Image src={review.author.imageUrl} alt="" width={36} height={36} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-500">
                            {review.author.firstName?.[0]}{review.author.lastName?.[0]}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        {/* Author + listing */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {review.author.firstName} {review.author.lastName}
                          </span>
                          <span className="text-gray-400 text-xs">·</span>
                          <Link
                            href={`/${review.listing.type.toLowerCase()}s`}
                            className="text-xs text-gray-500 hover:text-rose-600 transition-colors truncate"
                          >
                            {review.listing.title}
                          </Link>
                          <Badge className={`${typeColors[review.listing.type] ?? ""} border-0 text-xs`}>
                            {review.listing.type}
                          </Badge>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">{formatDate(review.createdAt)}</span>
                        </div>

                        {review.title && (
                          <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>

                        {review.response && (
                          <div className="mt-3 bg-gray-50 rounded-xl p-3 border-l-2 border-gray-300">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Provider response</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{review.response}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <ReviewDeleteBtn id={review.id} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?page=${p}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-rose-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
