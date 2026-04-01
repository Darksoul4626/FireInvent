import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryOverviewTable } from "@/components/inventory-overview-table";

const replaceMock = vi.fn();
let searchParams = new URLSearchParams("page=1&pageSize=20");

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace: replaceMock }),
    usePathname: () => "/inventory",
    useSearchParams: () => searchParams
}));

vi.mock("next/link", () => ({
    default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
        <a href={href} {...props}>{children}</a>
    )
}));

vi.mock("@/components/inventory-item-delete-action", () => ({
    InventoryItemDeleteAction: ({ itemId }: { itemId: string }) => (
        <button type="button" data-testid={`inventory-delete-button-${itemId}`}>loeschen</button>
    )
}));

describe("InventoryOverviewTable", () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        searchParams = new URLSearchParams("page=1&pageSize=20");

        fetchMock = vi.fn(async (input: RequestInfo | URL) => {
            const url = toRequestUrl(input);

            if (url.startsWith("/api/proxy/categories")) {
                return {
                    ok: true,
                    json: async () => ([
                        { id: "cat-1", name: "Wasser" },
                        { id: "cat-2", name: "Strom" }
                    ])
                } as Response;
            }

            if (url.startsWith("/api/proxy/items/overview")) {
                return {
                    ok: true,
                    json: async () => ({
                        items: [
                            {
                                id: "item-2",
                                inventoryCode: "INV-2",
                                name: "Zulu",
                                category: "Wasser",
                                condition: 1,
                                location: "Lager B",
                                totalQuantity: 2,
                                rented: 1,
                                available: 1
                            },
                            {
                                id: "item-1",
                                inventoryCode: "INV-1",
                                name: "Alpha",
                                category: "Strom",
                                condition: 1,
                                location: "Lager A",
                                totalQuantity: 4,
                                rented: 1,
                                available: 3
                            }
                        ],
                        page: 1,
                        pageSize: 20,
                        totalCount: 1,
                        totalPages: 1,
                        hasPrevious: false,
                        hasNext: false
                    })
                } as Response;
            }

            return {
                ok: false,
                json: async () => ({})
            } as Response;
        });

        vi.stubGlobal("fetch", fetchMock);
    });

    it("renders rows from backend overview response", async () => {
        render(<InventoryOverviewTable />);

        expect(await screen.findByTestId("inventory-row-item-1")).toBeInTheDocument();
        expect(screen.getAllByTestId("inventory-row-rented-item-1")[0]).toHaveTextContent("1");
        expect(screen.getAllByTestId("inventory-row-available-item-1")[0]).toHaveTextContent("3");

        const overviewRequest = fetchMock.mock.calls
            .map(([input]) => String(input))
            .find((url) => url.startsWith("/api/proxy/items/overview"));

        expect(overviewRequest).toBeDefined();
        expect(overviewRequest).not.toContain("sortBy=");
        expect(overviewRequest).not.toContain("sortDir=");
    });

    it("resets page to first page on category filter change", async () => {
        const user = userEvent.setup();
        searchParams = new URLSearchParams("page=3&pageSize=20");

        render(<InventoryOverviewTable />);

        const categorySelect = await screen.findByTestId("inventory-overview-category");
        await user.selectOptions(categorySelect, "Wasser");

        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalled();
        });

        expect(replaceMock.mock.calls.at(-1)?.[0]).toContain("category=Wasser");
        expect(replaceMock.mock.calls.at(-1)?.[0]).toContain("page=1");
    });

    it("sorts table locally on column header click without reloading from API", async () => {
        const user = userEvent.setup();
        render(<InventoryOverviewTable />);

        await screen.findByTestId("inventory-row-item-1");

        const firstRowBeforeSort = document.querySelector('[data-testid="inventory-table"] tbody tr');
        expect(firstRowBeforeSort).toHaveTextContent("Zulu");

        const initialOverviewRequests = fetchMock.mock.calls.filter(([input]) =>
            String(input).startsWith("/api/proxy/items/overview")
        ).length;

        await user.click(screen.getByTestId("inventory-table-sort-name"));

        const firstRowAfterSort = document.querySelector('[data-testid="inventory-table"] tbody tr');
        expect(firstRowAfterSort).toHaveTextContent("Alpha");

        const overviewRequestsAfterSort = fetchMock.mock.calls.filter(([input]) =>
            String(input).startsWith("/api/proxy/items/overview")
        ).length;

        expect(overviewRequestsAfterSort).toBe(initialOverviewRequests);
        expect(replaceMock).not.toHaveBeenCalled();
    });
});

function toRequestUrl(input: RequestInfo | URL): string {
    if (typeof input === "string") {
        return input;
    }

    if (input instanceof URL) {
        return input.toString();
    }

    return input.url;
}
