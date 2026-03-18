"use client";

import { useState, useTransition } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createPromoCode } from "@/actions/promo";

export function CreatePromoForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createPromoCode({
          code: form.code,
          description: form.description || undefined,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
          expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
        });
        toast({ title: "Promo code created!" });
        setOpen(false);
        setForm({ code: "", description: "", discountType: "PERCENTAGE", discountValue: "", minOrderAmount: "", maxUses: "", expiresAt: "" });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-rose-500 hover:bg-rose-600 gap-2">
        <PlusCircle className="h-4 w-4" /> New Promo Code
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Create Promo Code</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Code <span className="text-red-500">*</span></Label>
          <Input
            className="mt-1 uppercase font-mono"
            placeholder="SUMMER20"
            value={form.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            required
          />
        </div>

        <div>
          <Label>Description</Label>
          <Input
            className="mt-1"
            placeholder="20% off for summer"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div>
          <Label>Discount type <span className="text-red-500">*</span></Label>
          <select
            className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm bg-background"
            value={form.discountType}
            onChange={(e) => set("discountType", e.target.value)}
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed amount ($)</option>
          </select>
        </div>

        <div>
          <Label>Discount value <span className="text-red-500">*</span></Label>
          <Input
            type="number"
            className="mt-1"
            placeholder={form.discountType === "PERCENTAGE" ? "20" : "10.00"}
            value={form.discountValue}
            onChange={(e) => set("discountValue", e.target.value)}
            min="1"
            max={form.discountType === "PERCENTAGE" ? "100" : undefined}
            required
          />
        </div>

        <div>
          <Label>Min order amount ($)</Label>
          <Input
            type="number"
            className="mt-1"
            placeholder="50"
            value={form.minOrderAmount}
            onChange={(e) => set("minOrderAmount", e.target.value)}
            min="0"
          />
        </div>

        <div>
          <Label>Max uses</Label>
          <Input
            type="number"
            className="mt-1"
            placeholder="Unlimited"
            value={form.maxUses}
            onChange={(e) => set("maxUses", e.target.value)}
            min="1"
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Expiry date</Label>
          <Input
            type="date"
            className="mt-1"
            min={new Date().toISOString().split("T")[0]}
            value={form.expiresAt}
            onChange={(e) => set("expiresAt", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-rose-500 hover:bg-rose-600" disabled={isPending}>
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : "Create Code"}
          </Button>
        </div>
      </form>
    </div>
  );
}
