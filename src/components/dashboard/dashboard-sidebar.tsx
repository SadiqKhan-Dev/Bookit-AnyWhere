"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Star,
  Settings,
  PlusCircle,
  BarChart3,
  Globe,
  ChevronRight,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { User } from "@prisma/client";

interface DashboardSidebarProps {
  user: User & { _count?: { bookings: number; listings: number; reviews: number } };
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/listings", label: "My Listings", icon: Building2, providerOnly: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, providerOnly: true },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isProvider = user.role === "PROVIDER" || user.role === "ADMIN";

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">BookIt</span>
        </Link>
      </div>

      {/* User */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.imageUrl || ""} />
            <AvatarFallback>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <div className="flex items-center gap-1">
              <Badge
                className={cn(
                  "text-xs",
                  user.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700"
                    : user.role === "PROVIDER"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter((item) => !item.providerOnly || isProvider)
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-rose-50 text-rose-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", isActive ? "text-rose-500" : "text-gray-400")} />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}

        {isProvider && (
          <>
            <Separator className="my-2" />
            <Link
              href="/dashboard/listings/new"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Add new listing
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Link href="/">
          <div className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <Globe className="h-4 w-4" />
            Back to site
          </div>
        </Link>
      </div>
    </aside>
  );
}
