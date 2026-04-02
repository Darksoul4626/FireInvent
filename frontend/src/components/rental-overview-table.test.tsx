import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RentalOverviewTable } from "@/components/rental-overview-table";

const replaceMock = vi.fn();
let searchParams = new URLSearchParams("page=1&pageSize=20");

vi.mock("next/navigation", () => ({
    useRouter: () => ({ replace: replaceMock }),
    usePathname: () => "/rentals",
    useSearchParams: () => searchParams
}));

vi.mock("next/link", () => ({
    default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
        <a href={href} {...props}>{children}</a>
    )
}));

vi.mock("@/components/rental-status-actions", () => ({
    RentalStatusActions: ({ rentalId }: { rentalId: string }) => (
        <span data-testid={`rental-row-lifecycle-actions-${rentalId}`}>actions</span>
    )
}));

describe("RentalOverviewTable", () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        searchParams = new URLSearchParams("page=1&pageSize=20");

        fetchMock = vi.fn(async (input: RequestInfo | URL) => {
            const url = toRequestUrl(input);

            if (url.startsWith("/api/proxy/items")) {
                return {
                    ok: true,
                    json: async () => ([
                        { id: "item-1", inventoryCode: "INV-1", name: "Generator" }
                    ])
                } as Response;
            }

            if (url.startsWith("/api/proxy/rentals?") && url.includes("overview=true")) {
                return {
                    ok: true,
                    json: async () => ({
                        items: [
                            {
                                id: "rental-2",
                                itemSummary: "INV-9 - Zulu x1",
                                startDate: "2026-04-02T08:00:00.000Z",
                                endDate: "2026-04-02T10:00:00.000Z",
                                borrowerName: "Zoe",
                                totalQuantity: 1,
                                status: 1
                            },
                            {
                                id: "rental-1",
                                itemSummary: "INV-1 - Alpha x2",
                                startDate: "2026-04-01T08:00:00.000Z",
                                endDate: "2026-04-01T18:00:00.000Z",
                                borrowerName: "Max",
                                totalQuantity: 2,
                                status: 0
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

    it("renders backend overview rows", async () => {
        render(<RentalOverviewTable />);

        expect(await screen.findByTestId("rental-row-rental-1")).toBeInTheDocument();
        expect(screen.getAllByTestId("rental-row-status-rental-1")[0]).toHaveTextContent("Planned");

        const overviewRequest = fetchMock.mock.calls
            .map(([input]) => String(input))
            .find((url) => url.startsWith("/api/proxy/rentals?") && url.includes("overview=true"));

        expect(overviewRequest).toBeDefined();
        expect(overviewRequest).not.toContain("sortBy=");
        expect(overviewRequest).not.toContain("sortDir=");
    });

    it("resets page to first page when status filter changes", async () => {
        const user = userEvent.setup();
        searchParams = new URLSearchParams("page=4&pageSize=20");

        render(<RentalOverviewTable />);

        const statusSelect = await screen.findByTestId("rentals-overview-status");
        await user.selectOptions(statusSelect, "Active");

        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalled();
        });

        expect(replaceMock.mock.calls.at(-1)?.[0]).toContain("status=Active");
        expect(replaceMock.mock.calls.at(-1)?.[0]).toContain("page=1");
    });

    it("sorts rentals locally on header click without API reload", async () => {
        const user = userEvent.setup();
        render(<RentalOverviewTable />);

        await screen.findByTestId("rental-row-rental-1");

        const firstRowBeforeSort = document.querySelector('[data-testid="rentals-table"] tbody tr');
        expect(firstRowBeforeSort).toHaveTextContent("Zulu");

        const initialOverviewRequests = fetchMock.mock.calls.filter(([input]) =>
            String(input).startsWith("/api/proxy/rentals?") && String(input).includes("overview=true")
        ).length;

        await user.click(screen.getByTestId("rentals-table-sort-itemSummary"));

        const firstRowAfterSort = document.querySelector('[data-testid="rentals-table"] tbody tr');
        expect(firstRowAfterSort).toHaveTextContent("Alpha");

        const overviewRequestsAfterSort = fetchMock.mock.calls.filter(([input]) =>
            String(input).startsWith("/api/proxy/rentals?") && String(input).includes("overview=true")
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
