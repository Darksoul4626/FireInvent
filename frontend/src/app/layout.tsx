import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="de" suppressHydrationWarning>
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <AppShell>{children}</AppShell>
                </ThemeProvider>
            </body>
        </html>
    );
}
