"use client";

import React, { useState, useTransition } from "react";
import { MessageSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { respondToReview } from "@/actions/review";

interface ReviewRespondFormProps {
  reviewId: string;
  existingResponse?: string | null;
  listingSlug: string;
}

export function ReviewRespondForm({ reviewId, existingResponse, listingSlug }: ReviewRespondFormProps) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState(existingResponse ?? "");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  if (!open && existingResponse) {
    return (
      <div className="mt-3 ml-4 pl-4 border-l-2 border-rose-100">
        <p className="text-xs font-semibold text-gray-500 mb-1">Your response</p>
        <p className="text-sm text-gray-600">{existingResponse}</p>
        <button
          onClick={() => setOpen(true)}
          className="mt-1 text-xs text-rose-500 hover:underline"
        >
          Edit response
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Reply to review
      </button>
    );
  }

  const handleSubmit = () => {
    if (!response.trim()) return;
    startTransition(async () => {
      try {
        await respondToReview(reviewId, response, listingSlug);
        toast({ title: "Response saved" });
        setOpen(false);
      } catch (err: any) {
        toast({ title: "Failed to save", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="mt-3 space-y-2">
      <Textarea
        rows={3}
        placeholder="Write your response to this review..."
        value={response}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponse(e.target.value)}
        className="resize-none text-sm"
        autoFocus
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="bg-rose-500 hover:bg-rose-600 text-white gap-1.5"
          onClick={handleSubmit}
          disabled={isPending || !response.trim()}
        >
          <Check className="h-3.5 w-3.5" />
          {isPending ? "Saving..." : "Save Response"}
        </Button>
      </div>
    </div>
  );
}
