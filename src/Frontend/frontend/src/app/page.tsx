import Link from "next/link";

export default function Page() {
    return (
        <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
            <h1>FireInvent Frontend</h1>
            <p>Basisnavigation fuer Inventaransichten.</p>
            <p>
                <Link href="/inventory">Zur Inventarliste</Link>
            </p>
            <p>
                <Link href="/rentals">Zur Vermietungsliste</Link>
            </p>
            <p>
                <Link href="/calendar">Zum Vermietungskalender</Link>
            </p>
        </main>
    );
}
