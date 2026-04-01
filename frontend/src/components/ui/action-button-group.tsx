import * as React from "react";
import { cn } from "@/lib/utils";

type ActionButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

export function ActionButtonGroup({ className, children, ...props }: Readonly<ActionButtonGroupProps>) {
    return (
        <div className={cn("inline-flex flex-wrap items-center gap-2", className)} {...props}>
            {children}
        </div>
    );
}