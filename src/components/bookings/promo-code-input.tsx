"use client";

import { useState, useTransition } from "react";
import { Tag, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validatePromoCode } from "@/actions/promo";
import { formatCurrency } from "@/lib/utils";

interface PromoCodeInputProps {
  subtotal: number; // in cents
  listingId?: string;
  onApply: (promoCodeId: string, discountAmount: number, code: string) => void;
  onRemove: () => void;
  appliedCode?: string;
}

export function PromoCodeInput({
  subtotal,
  listingId,
  onApply,
  onRemove,
  appliedCode,
}: PromoCodeInputProps) {
  const [code, setCode] = useState(appliedCode ?? "");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    if (!code.trim()) return;
    setError("");
    setSuccessMsg("");
    startTransition(async () => {
      const result = await validatePromoCode(code, subtotal, listingId);
      if (result.valid && result.promoCodeId && result.discountAmount !== undefined) {
        setSuccessMsg(result.message ?? "Promo applied!");
        onApply(result.promoCodeId, result.discountAmount, code.trim().toUpperCase());
      } else {
        setError(result.message ?? "Invalid code");
      }
    });
  };

  const handleRemove = () => {
    setCode("");
    setError("");
    setSuccessMsg("");
    onRemove();
  };

  const isApplied = !!appliedCode;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            className="pl-8 uppercase text-sm font-mono"
            placeholder="PROMO CODE"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
              setSuccessMsg("");
            }}
            disabled={isApplied || isPending}
            onKeyDown={(e) => e.key === "Enter" && !isApplied && handleApply()}
          />
        </div>
        {isApplied ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="shrink-0 text-red-500 border-red-200 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleApply}
            disabled={!code.trim() || isPending}
            className="shrink-0"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X className="h-3 w-3" /> {error}
        </p>
      )}
      {successMsg && (
        <p className="text-xs text-emerald-600 flex items-center gap-1">
          <Check className="h-3 w-3" /> {successMsg}
        </p>
      )}
    </div>
  );
}
