"use client";

import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateUserRole } from "@/actions/admin";
import type { UserRole } from "@prisma/client";

interface UserRoleSelectProps {
  userId: string;
  currentRole: UserRole;
}

const ROLES: UserRole[] = ["CUSTOMER", "PROVIDER", "ADMIN"];

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    startTransition(async () => {
      try {
        await updateUserRole(userId, role);
        toast({ title: "Role updated" });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
