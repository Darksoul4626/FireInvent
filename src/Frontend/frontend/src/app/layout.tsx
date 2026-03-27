import type { ReactNode } from "react";
import Link from "next/link";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="de">
            <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui" }}>
                <header style={{ borderBottom: "1px solid #e5e7eb", padding: "12px 24px", background: "#f9fafb" }}>
                    <nav data-testid="main-navigation" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <Link href="/">Start</Link>
                        <Link href="/inventory">Inventar</Link>
                        <Link href="/rentals">Vermietungen</Link>
                        <Link href="/calendar">Kalender</Link>
                    </nav>
                </header>
                {children}
            </body>
        </html>
    );
}
