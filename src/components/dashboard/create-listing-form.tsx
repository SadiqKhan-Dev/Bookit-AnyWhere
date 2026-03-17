"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scissors, Building2, Stethoscope, Upload, MapPin, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createListing } from "@/actions/listing";
import { createListingSchema, type CreateListingInput } from "@/validations";
import { cn } from "@/lib/utils";

const listingTypes = [
  {
    id: "SALON",
    label: "Salon / Spa",
    description: "Hair, beauty & wellness services",
    icon: Scissors,
    color: "text-pink-500",
    border: "border-pink-500 bg-pink-50",
  },
  {
    id: "HOTEL",
    label: "Hotel / Stay",
    description: "Rooms, suites & accommodations",
    icon: Building2,
    color: "text-blue-500",
    border: "border-blue-500 bg-blue-50",
  },
  {
    id: "MEDICAL",
    label: "Medical Clinic",
    description: "Doctors & healthcare",
    icon: Stethoscope,
    color: "text-emerald-500",
    border: "border-emerald-500 bg-emerald-50",
  },
] as const;

export function CreateListingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [listingType, setListingType] = useState<"SALON" | "HOTEL" | "MEDICAL">("SALON");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      type: "SALON",
      country: "US",
      images: [],
    },
  });

  const onSubmit = async (data: CreateListingInput) => {
    startTransition(async () => {
      try {
        const result = await createListing({ ...data, type: listingType, coverImage: coverImageUrl || data.coverImage });
        toast({ title: "Listing created successfully! 🎉", variant: "success" as any });
        router.push(`/dashboard/listings`);
      } catch (error: any) {
        toast({ title: "Failed to create listing", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Step 1: Type */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Type of listing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {listingTypes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setListingType(t.id);
                    setValue("type", t.id);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all",
                    listingType === t.id ? t.border : "border-gray-100 hover:border-gray-200 bg-white"
                  )}
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", listingType === t.id ? "bg-white" : "bg-gray-50")}>
                    <Icon className={cn("h-6 w-6", t.color)} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-gray-900">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Basic Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label>Business name *</Label>
            <Input className="mt-1" placeholder="My Amazing Salon" {...register("title")} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label>Description *</Label>
            <textarea
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Describe your business, services, and what makes you special..."
              {...register("description")}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Starting price *</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  className="pl-9"
                  placeholder="50"
                  step="0.01"
                  {...register("priceFrom", { valueAsNumber: true })}
                />
              </div>
              {errors.priceFrom && <p className="text-xs text-red-500 mt-1">{errors.priceFrom.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Location */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Street address *</Label>
            <Input className="mt-1" placeholder="123 Main Street" {...register("address")} />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City *</Label>
              <Input className="mt-1" placeholder="New York" {...register("city")} />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <Label>State *</Label>
              <Input className="mt-1" placeholder="NY" {...register("state")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ZIP code *</Label>
              <Input className="mt-1" placeholder="10001" {...register("zipCode")} />
            </div>
            <div>
              <Label>Country</Label>
              <Input className="mt-1" defaultValue="US" {...register("country")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Latitude *</Label>
              <Input
                type="number"
                step="any"
                className="mt-1"
                placeholder="40.7128"
                {...register("latitude", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label>Longitude *</Label>
              <Input
                type="number"
                step="any"
                className="mt-1"
                placeholder="-74.0060"
                {...register("longitude", { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Images */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Cover image URL *</Label>
            <Input
              className="mt-1"
              placeholder="https://..."
              value={coverImageUrl}
              onChange={(e) => {
                setCoverImageUrl(e.target.value);
                setValue("coverImage", e.target.value);
              }}
            />
            <p className="text-xs text-gray-400 mt-1">Paste an image URL or use UploadThing (configured in settings)</p>
            {errors.coverImage && <p className="text-xs text-red-500 mt-1">{errors.coverImage.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={isPending} className="bg-rose-500 hover:bg-rose-600 text-white px-8">
          {isPending ? "Creating..." : "Create Listing"}
        </Button>
      </div>
    </form>
  );
}
