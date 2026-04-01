import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", {
    variants: {
        variant: {
            default: "border-transparent bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900",
            secondary: "border-transparent bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100",
            outline: "text-slate-900 dark:text-slate-100",
            danger: "border-transparent bg-red-700 text-white"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
