"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, Scissors, Building2, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { syncUser, becomeProvider } from "@/actions/user";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "PROVIDER">("CUSTOMER");

  const handleContinue = async () => {
    startTransition(async () => {
      try {
        await syncUser();
        if (selectedRole === "PROVIDER") {
          await becomeProvider();
        }
        router.push("/dashboard");
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 mb-4">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to BookIt!</h1>
          <p className="text-gray-500 mt-2">How will you be using BookIt?</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setSelectedRole("CUSTOMER")}
            className={cn(
              "flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all",
              selectedRole === "CUSTOMER"
                ? "border-rose-500 bg-rose-50"
                : "border-gray-200 bg-white hover:border-rose-200"
            )}
          >
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", selectedRole === "CUSTOMER" ? "bg-rose-500" : "bg-gray-100")}>
              <User className={cn("h-7 w-7", selectedRole === "CUSTOMER" ? "text-white" : "text-gray-400")} />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">I&apos;m a customer</p>
              <p className="text-xs text-gray-500 mt-1">Browse & book services, hotels, and medical appointments</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole("PROVIDER")}
            className={cn(
              "flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all",
              selectedRole === "PROVIDER"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-blue-200"
            )}
          >
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", selectedRole === "PROVIDER" ? "bg-blue-500" : "bg-gray-100")}>
              <Building2 className={cn("h-7 w-7", selectedRole === "PROVIDER" ? "text-white" : "text-gray-400")} />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">I&apos;m a provider</p>
              <p className="text-xs text-gray-500 mt-1">List my business — salon, hotel, or medical clinic</p>
            </div>
          </button>
        </div>

        {selectedRole === "PROVIDER" && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
            <p className="font-medium mb-1">As a provider, you can:</p>
            <ul className="space-y-1 text-blue-600">
              <li>✓ Create and manage listings</li>
              <li>✓ Accept and manage bookings</li>
              <li>✓ Receive payments via Stripe</li>
              <li>✓ View analytics and reviews</li>
            </ul>
          </div>
        )}

        <Button
          onClick={handleContinue}
          loading={isPending}
          size="xl"
          className="w-full bg-rose-500 hover:bg-rose-600 text-white"
        >
          Get started
        </Button>
      </div>
    </div>
  );
}
