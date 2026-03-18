"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createReview } from "@/actions/review";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

interface ReviewFormProps {
  bookingId: string;
  listingId: string;
  listingTitle: string;
}

export function ReviewForm({ bookingId, listingId, listingTitle }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const displayed = hovered || rating;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    if (comment.trim().length < 10) {
      toast({ title: "Review too short", description: "Please write at least 10 characters.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      try {
        await createReview({ bookingId, listingId, rating, title: title || undefined, comment });
        toast({ title: "Review submitted!", description: "Thank you for your feedback." });
        router.push(`/bookings/${bookingId}`);
        router.refresh();
      } catch (err: any) {
        toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Listing context */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-500">Writing a review for</p>
        <p className="font-semibold text-gray-900 mt-0.5">{listingTitle}</p>
      </div>

      {/* Star rating */}
      <div className="space-y-2">
        <Label>Your Rating <span className="text-red-500">*</span></Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= displayed
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200"
                }`}
              />
            </button>
          ))}
          {displayed > 0 && (
            <span className="ml-2 text-sm font-medium text-amber-600">
              {RATING_LABELS[displayed]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Review Title <span className="text-gray-400 font-normal">(optional)</span></Label>
        <Input
          id="title"
          placeholder="Summarise your experience..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">
          Your Review <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your experience — what did you love? What could be improved?"
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          className="resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{comment.length}/1000</p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
          disabled={isPending || rating === 0}
        >
          {isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
