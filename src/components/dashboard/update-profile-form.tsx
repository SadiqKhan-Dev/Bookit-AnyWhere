"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "@/actions/user";
import { updateProfileSchema, type UpdateProfileInput } from "@/validations";
import type { User } from "@prisma/client";

export function UpdateProfileForm({ user }: { user: User }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    startTransition(async () => {
      try {
        await updateProfile(data);
        toast({ title: "Profile updated successfully!" });
      } catch (error: any) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>First name</Label>
          <Input className="mt-1" {...register("firstName")} />
          {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <Label>Last name</Label>
          <Input className="mt-1" {...register("lastName")} />
          {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
        </div>
      </div>
      <div>
        <Label>Phone number</Label>
        <Input type="tel" className="mt-1" placeholder="+1 555 000 0000" {...register("phone")} />
      </div>
      <Button type="submit" loading={isPending} className="bg-rose-500 hover:bg-rose-600 text-white">
        Save changes
      </Button>
    </form>
  );
}
