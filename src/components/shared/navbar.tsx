"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Scissors, Building2, Stethoscope, Menu, Globe, Heart, Plane, Ship, HeartHandshake, UtensilsCrossed, Wrench, Camera, Flower2, Music } from "lucide-react";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const categories = [
  {
    label: "Salons",
    href: "/salons",
    icon: Scissors,
    color: "text-pink-500",
    hoverBg: "hover:bg-pink-50",
    active: "text-pink-600 bg-pink-50",
  },
  {
    label: "Hotels",
    href: "/hotels",
    icon: Building2,
    color: "text-blue-500",
    hoverBg: "hover:bg-blue-50",
    active: "text-blue-600 bg-blue-50",
  },
  {
    label: "Doctors",
    href: "/doctors",
    icon: Stethoscope,
    color: "text-emerald-500",
    hoverBg: "hover:bg-emerald-50",
    active: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Flights",
    href: "/flights",
    icon: Plane,
    color: "text-violet-500",
    hoverBg: "hover:bg-violet-50",
    active: "text-violet-600 bg-violet-50",
  },
  {
    label: "Cruises",
    href: "/cruises",
    icon: Ship,
    color: "text-teal-500",
    hoverBg: "hover:bg-teal-50",
    active: "text-teal-600 bg-teal-50",
  },
  {
    label: "Wedding Halls",
    href: "/marriage-halls",
    icon: HeartHandshake,
    color: "text-amber-500",
    hoverBg: "hover:bg-amber-50",
    active: "text-amber-600 bg-amber-50",
  },
  {
    label: "Catering",
    href: "/catering",
    icon: UtensilsCrossed,
    color: "text-red-500",
    hoverBg: "hover:bg-red-50",
    active: "text-red-600 bg-red-50",
  },
  {
    label: "Mechanics",
    href: "/mechanics",
    icon: Wrench,
    color: "text-slate-500",
    hoverBg: "hover:bg-slate-50",
    active: "text-slate-600 bg-slate-50",
  },
  {
    label: "Photography",
    href: "/photography",
    icon: Camera,
    color: "text-purple-500",
    hoverBg: "hover:bg-purple-50",
    active: "text-purple-600 bg-purple-50",
  },
  {
    label: "Decorators",
    href: "/decorators",
    icon: Flower2,
    color: "text-rose-500",
    hoverBg: "hover:bg-rose-50",
    active: "text-rose-600 bg-rose-50",
  },
  {
    label: "Musicians",
    href: "/musicians",
    icon: Music,
    color: "text-indigo-500",
    hoverBg: "hover:bg-indigo-50",
    active: "text-indigo-600 bg-indigo-50",
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">BookIt</span>
        </Link>

        {/* Category Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = pathname.startsWith(cat.href);
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isActive ? cat.active : `text-gray-600 hover:text-gray-900 ${cat.hoverBg}`
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "" : "opacity-70")} />
                {cat.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link href="/dashboard/listings/new" className="hidden md:block">
              <Button variant="outline" size="sm">
                List your space
              </Button>
            </Link>
            <Link href="/wishlist" className="hidden md:block">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5 text-gray-600" />
              </Button>
            </Link>
            <div className="hidden md:block">
              <NotificationsDropdown />
            </div>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white">
                Sign up
              </Button>
            </Link>
          </SignedOut>

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <DropdownMenuItem key={cat.href} asChild>
                    <Link href={cat.href} className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", cat.color)} />
                      {cat.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/bookings">My Bookings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/wishlist">Wishlist</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
