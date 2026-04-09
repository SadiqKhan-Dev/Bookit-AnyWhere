import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        salon: "border-transparent bg-pink-100 text-pink-800",
        hotel: "border-transparent bg-blue-100 text-blue-800",
        medical: "border-transparent bg-emerald-100 text-emerald-800",
        pending: "border-transparent bg-yellow-100 text-yellow-800",
        confirmed: "border-transparent bg-blue-100 text-blue-800",
        completed: "border-transparent bg-green-100 text-green-800",
        cancelled: "border-transparent bg-red-100 text-red-800",
        "marriage-hall": "border-transparent bg-amber-100 text-amber-800",
        catering: "border-transparent bg-red-100 text-red-800",
        mechanic: "border-transparent bg-slate-100 text-slate-800",
        photography: "border-transparent bg-purple-100 text-purple-800",
        decorator: "border-transparent bg-rose-100 text-rose-800",
        musician: "border-transparent bg-indigo-100 text-indigo-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
