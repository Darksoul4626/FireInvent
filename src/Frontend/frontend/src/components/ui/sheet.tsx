"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;

const SheetPortal = ({ ...props }: Dialog.DialogPortalProps) => <Dialog.Portal {...props} />;

const SheetOverlay = React.forwardRef<
    React.ElementRef<typeof Dialog.Overlay>,
    React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
    <Dialog.Overlay
        ref={ref}
        className={cn("fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm", className)}
        {...props}
    />
));
SheetOverlay.displayName = Dialog.Overlay.displayName;

const SheetContent = React.forwardRef<
    React.ElementRef<typeof Dialog.Content>,
    React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
    <SheetPortal>
        <SheetOverlay />
        <Dialog.Content
            ref={ref}
            className={cn(
                "fixed inset-y-0 left-0 z-50 w-[18rem] border-r border-slate-300 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900",
                className
            )}
            {...props}
        >
            {children}
            <Dialog.Close className="absolute right-3 top-3 rounded-md p-1 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </Dialog.Close>
        </Dialog.Content>
    </SheetPortal>
));
SheetContent.displayName = Dialog.Content.displayName;

export { Sheet, SheetClose, SheetContent, SheetTrigger };
