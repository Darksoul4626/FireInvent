import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryItemDeleteAction } from "@/components/inventory-item-delete-action";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const parseApiErrorMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock, refresh: refreshMock })
}));

vi.mock("@/lib/api/api-error", () => ({
    parseApiError: (...args: unknown[]) => parseApiErrorMock(...args)
}));

describe("InventoryItemDeleteAction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders delete button with stable test id", () => {
        render(<InventoryItemDeleteAction itemId="item-1" itemName="Generator" />);

        expect(screen.getByTestId("inventory-delete-button-item-1")).toBeInTheDocument();
    });

    it("does not call delete endpoint when confirmation is canceled", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn();
        const confirmSpy = vi.spyOn(globalThis, "confirm").mockReturnValue(false);
        vi.stubGlobal("fetch", fetchMock);

        render(<InventoryItemDeleteAction itemId="item-2" itemName="Leiter" />);

        await user.click(screen.getByTestId("inventory-delete-button-item-2"));

        expect(fetchMock).not.toHaveBeenCalled();
        confirmSpy.mockRestore();
    });

    it("shows parsed api error when delete request fails", async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(globalThis, "confirm").mockReturnValue(true);
        parseApiErrorMock.mockResolvedValue({ message: "Kann nicht geloescht werden", fieldErrors: [] });
        vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 409 })));

        render(<InventoryItemDeleteAction itemId="item-3" itemName="Pumpe" />);

        await user.click(screen.getByTestId("inventory-delete-button-item-3"));

        expect(await screen.findByTestId("inventory-delete-error-item-3")).toHaveTextContent("Kann nicht geloescht werden");
        expect(refreshMock).not.toHaveBeenCalled();
        confirmSpy.mockRestore();
    });

    it("refreshes and redirects on successful delete when redirect path is provided", async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(globalThis, "confirm").mockReturnValue(true);
        vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true })));

        render(<InventoryItemDeleteAction itemId="item-4" itemName="Schlauch" redirectPath="/inventory" />);

        await user.click(screen.getByTestId("inventory-delete-button-item-4"));

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/inventory");
            expect(refreshMock).toHaveBeenCalled();
        });

        confirmSpy.mockRestore();
    });
});
