import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RentalBookingForm } from "@/components/rental-booking-form";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock, refresh: refreshMock })
}));

vi.mock("@/lib/api/api-error", () => ({
    parseApiError: vi.fn(async () => ({ message: "error", fieldErrors: [] }))
}));

describe("RentalBookingForm", () => {
    const itemOptions = [
        {
            id: "11111111-1111-1111-1111-111111111111",
            name: "Generator",
            inventoryCode: "INV-1",
            totalQuantity: 8
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows validation error when end date is before start date", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn(async () => ({
            ok: true,
            json: async () => ({ availableQuantity: 5, reservedOrRentedQuantity: 3, totalQuantity: 8 })
        }));
        vi.stubGlobal("fetch", fetchMock);

        render(<RentalBookingForm mode="create" itemOptions={itemOptions} />);

        await user.type(screen.getByTestId("rental-start-input"), "2026-03-10");
        await user.type(screen.getByTestId("rental-end-input"), "2026-03-09");

        const quantityInput = screen.getByTestId("rental-quantity-input") as HTMLInputElement;
        await user.clear(quantityInput);
        await user.type(quantityInput, "1");

        await user.click(screen.getByTestId("rental-submit-button"));

        expect(screen.getByText("Enddatum muss groesser oder gleich Startdatum sein.")).toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalledWith(
            "/api/proxy/rentals",
            expect.objectContaining({ method: "POST" })
        );
    });

    it("submits create rental payload", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn(async (input: string | URL) => {
            if (String(input).includes("/availability?")) {
                return {
                    ok: true,
                    json: async () => ({ availableQuantity: 6, reservedOrRentedQuantity: 2, totalQuantity: 8 })
                };
            }

            return { ok: true };
        });
        vi.stubGlobal("fetch", fetchMock);

        render(<RentalBookingForm mode="create" itemOptions={itemOptions} />);

        await user.type(screen.getByTestId("rental-start-input"), "2026-03-10");
        await user.type(screen.getByTestId("rental-end-input"), "2026-03-10");
        const quantityInput = screen.getByTestId("rental-quantity-input") as HTMLInputElement;
        await user.clear(quantityInput);
        await user.type(quantityInput, "2");

        await user.click(screen.getByTestId("rental-submit-button"));

        const submitCall = fetchMock.mock.calls.find(([url]) => String(url) === "/api/proxy/rentals");
        expect(submitCall).toBeDefined();

        const [url, options] = submitCall as [string, RequestInit];
        expect(url).toBe("/api/proxy/rentals");
        expect(options.method).toBe("POST");

        const body = JSON.parse(String(options.body));
        expect(body.itemId).toBe(itemOptions[0].id);
        expect(body.quantity).toBe(2);
        expect(typeof body.startDate).toBe("string");
        expect(typeof body.endDate).toBe("string");
        expect(pushMock).toHaveBeenCalledWith("/rentals");
        expect(refreshMock).toHaveBeenCalled();
    });

    it("shows total stock and range availability info", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn(async () => ({
            ok: true,
            json: async () => ({ availableQuantity: 6, reservedOrRentedQuantity: 2, totalQuantity: 8 })
        }));
        vi.stubGlobal("fetch", fetchMock);

        render(<RentalBookingForm mode="create" itemOptions={itemOptions} />);

        expect(screen.getByTestId("rental-item-total-quantity")).toHaveTextContent("Gesamtbestand: 8");

        await user.type(screen.getByTestId("rental-start-input"), "2026-03-10");
        await user.type(screen.getByTestId("rental-end-input"), "2026-03-12");

        expect(await screen.findByTestId("rental-availability-info")).toHaveTextContent("Verfuegbar im Zeitraum: 6");
    });
});
