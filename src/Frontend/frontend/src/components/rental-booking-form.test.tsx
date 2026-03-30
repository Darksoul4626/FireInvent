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
        const fetchMock = vi.fn();
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
        const fetchMock = vi.fn(async () => ({ ok: true }));
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
        expect(body.lines).toEqual([{ itemId: itemOptions[0].id, quantity: 2 }]);
        expect(body.borrowerName).toBeNull();
        expect(typeof body.startDate).toBe("string");
        expect(typeof body.endDate).toBe("string");
        expect(pushMock).toHaveBeenCalledWith("/rentals");
        expect(refreshMock).toHaveBeenCalled();
    });

    it("adds a second line and submits normalized lines", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn(async () => ({ ok: true }));
        vi.stubGlobal("fetch", fetchMock);

        render(<RentalBookingForm mode="create" itemOptions={itemOptions} />);

        await user.click(screen.getByTestId("rental-add-line-button"));

        const secondQuantityInput = screen.getByTestId("rental-line-quantity-input-1") as HTMLInputElement;
        await user.clear(secondQuantityInput);
        await user.type(secondQuantityInput, "3");

        await user.type(screen.getByTestId("rental-start-input"), "2026-03-10");
        await user.type(screen.getByTestId("rental-end-input"), "2026-03-11");
        await user.click(screen.getByTestId("rental-submit-button"));

        const submitCall = fetchMock.mock.calls.find(([url]) => String(url) === "/api/proxy/rentals");
        expect(submitCall).toBeDefined();

        const [, options] = submitCall as [string, RequestInit];
        const body = JSON.parse(String(options.body));
        expect(body.lines).toEqual([{ itemId: itemOptions[0].id, quantity: 4 }]);
    });
});
