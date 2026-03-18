"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, Calendar, X, Star, Tag, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotifications, markNotificationsRead } from "@/actions/user";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
};

const typeIcon: Record<string, React.ElementType> = {
  BOOKING_CONFIRMED: Calendar,
  BOOKING_CANCELLED: X,
  REVIEW_RECEIVED: Star,
  PROMO_CODE: Tag,
};

const typeColor: Record<string, string> = {
  BOOKING_CONFIRMED: "bg-emerald-100 text-emerald-600",
  BOOKING_CANCELLED: "bg-red-100 text-red-600",
  REVIEW_RECEIVED: "bg-amber-100 text-amber-600",
  PROMO_CODE: "bg-violet-100 text-violet-600",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getNotifications().then((data) => setNotifications(data as Notification[])).catch(() => {});
  }, []);

  const unread = notifications.filter((n) => !n.isRead).length;

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-rose-500 border-0">
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl shadow-xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-sm text-gray-900">Notifications</span>
            {unread > 0 && (
              <Badge className="bg-rose-100 text-rose-600 border-0 text-xs px-1.5 py-0">{unread} new</Badge>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = typeIcon[notif.type] ?? Bell;
              const colorCls = typeColor[notif.type] ?? "bg-gray-100 text-gray-500";
              const Wrapper = notif.link ? Link : "div";
              const wrapperProps = notif.link ? { href: notif.link, onClick: () => setOpen(false) } : {};

              return (
                <Wrapper
                  key={notif.id}
                  {...(wrapperProps as any)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer",
                    notif.isRead ? "bg-white hover:bg-gray-50/50" : "bg-rose-50/40 hover:bg-rose-50/60"
                  )}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${colorCls}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <p className={cn("text-sm font-medium leading-tight", notif.isRead ? "text-gray-700" : "text-gray-900")}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                </Wrapper>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-4 py-2.5 bg-gray-50">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
            >
              View all in dashboard
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
