"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Flame, Home, Menu, Package, PanelLeftClose, PanelLeftOpen, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { href: "/", label: "Start", icon: Home },
    { href: "/inventory", label: "Inventar", icon: Package },
    { href: "/rentals", label: "Vermietungen", icon: ReceiptText },
    { href: "/calendar", label: "Kalender", icon: CalendarDays }
] as const;

type Props = {
    children: React.ReactNode;
};

const COLLAPSE_KEY = "fireinvent:sidenav:collapsed";

export function AppShell({ children }: Readonly<Props>) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const value = globalThis.localStorage.getItem(COLLAPSE_KEY);
        setCollapsed(value === "true");
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    function toggleCollapsed() {
        setCollapsed((previous) => {
            const next = !previous;
            globalThis.localStorage.setItem(COLLAPSE_KEY, String(next));
            return next;
        });
    }

    const desktopWidthClass = collapsed ? "w-20" : "w-72";

    return (
        <div className="fi-shell">
            <aside className={cn("fi-sidebar sticky top-0 hidden h-screen shrink-0 transition-all duration-200 lg:block", desktopWidthClass)}>
                <div className="flex h-full flex-col gap-4 p-4">
                    <div className="fi-brand-chip flex items-center justify-between gap-2 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-3">
                            <Flame className="h-5 w-5" />
                            {collapsed ? null : <span className="text-sm font-semibold tracking-wide">FireInvent</span>}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-50 hover:bg-white/15 hover:text-white"
                            onClick={toggleCollapsed}
                            aria-label={collapsed ? "Sidenav aufklappen" : "Sidenav einklappen"}
                        >
                            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                        </Button>
                    </div>

                    <nav data-testid="main-navigation" className="grid gap-2" aria-label="Hauptnavigation">
                        {NAV_ITEMS.map((item) => {
                            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    data-active={active}
                                    aria-label={item.label}
                                    title={collapsed ? item.label : undefined}
                                    className={cn(
                                        "fi-sidebar-link flex items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors",
                                        collapsed ? "justify-center" : "gap-2"
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {collapsed ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <div className="fi-main">
                <header className="sticky top-0 z-30 border-b border-(--border) bg-[color-mix(in_srgb,var(--card)_90%,transparent)] backdrop-blur">
                    <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
                        <div className="flex items-center gap-2 lg:hidden">
                            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                                <SheetTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" aria-label="Navigation oeffnen">
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <div className="fi-brand-chip mb-4 flex items-center gap-2 rounded-lg px-3 py-2">
                                        <Flame className="h-5 w-5" />
                                        <span className="text-sm font-semibold">FireInvent</span>
                                    </div>
                                    <nav data-testid="main-navigation" className="grid gap-2" aria-label="Mobile Hauptnavigation">
                                        {NAV_ITEMS.map((item) => {
                                            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    data-active={active}
                                                    className="fi-sidebar-link flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium"
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </SheetContent>
                            </Sheet>
                            <span className="text-sm font-semibold tracking-wide">FireInvent</span>
                        </div>

                        <div className="hidden items-center gap-2 lg:flex">
                            <Flame className="h-5 w-5 text-red-700 dark:text-red-400" />
                            <span className="text-sm font-semibold tracking-wide">Feuerwehr Inventarportal</span>
                        </div>

                        <ThemeToggle />
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
            </div>
        </div>
    );
}
