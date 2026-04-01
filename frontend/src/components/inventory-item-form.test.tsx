import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryItemForm } from "@/components/inventory-item-form";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock, refresh: refreshMock })
}));

vi.mock("@/lib/api/api-error", () => ({
    parseApiError: vi.fn(async () => ({ message: "error", fieldErrors: [] }))
}));

describe("InventoryItemForm", () => {
    const categoryOptions = [
        { id: "cat-1", name: "Wasser" },
        { id: "cat-2", name: "Rescue" }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("submits create payload with trimmed values", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn(async () => ({
            ok: true,
            json: async () => ({ id: "item-1" })
        }));
        vi.stubGlobal("fetch", fetchMock);

        render(<InventoryItemForm mode="create" categoryOptions={categoryOptions} />);

        await user.type(screen.getByTestId("inventory-code-input"), "  INV-100  ");
        await user.type(screen.getByTestId("inventory-name-input"), "  Schlauch  ");
        await user.type(screen.getByTestId("inventory-category-select"), "Wasser");
        await user.selectOptions(screen.getByTestId("inventory-condition-select"), "Good");
        await user.type(screen.getByTestId("inventory-location-input"), "  Lager  ");

        const quantityInput = screen.getByTestId("inventory-total-quantity-input") as HTMLInputElement;
        await user.clear(quantityInput);
        await user.type(quantityInput, "5");

        await user.click(screen.getByTestId("inventory-submit-button"));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe("/api/proxy/items");
        expect(options.method).toBe("POST");

        const body = JSON.parse(String(options.body));
        expect(body).toEqual({
            inventoryCode: "INV-100",
            name: "Schlauch",
            category: "Wasser",
            condition: 1,
            location: "Lager",
            totalQuantity: 5
        });

        expect(pushMock).toHaveBeenCalledWith("/inventory/item-1");
        expect(refreshMock).toHaveBeenCalled();
    });

    it("uses update endpoint in edit mode", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn(async () => ({
            ok: true,
            json: async () => ({ id: "item-2" })
        }));
        vi.stubGlobal("fetch", fetchMock);

        render(
            <InventoryItemForm
                mode="edit"
                itemId="item-2"
                categoryOptions={categoryOptions}
                initialValues={{
                    inventoryCode: "INV-2",
                    name: "Alt",
                    category: "Rescue",
                    condition: "Good",
                    location: "Alt",
                    totalQuantity: 1
                }}
            />
        );

        const nameInput = screen.getByTestId("inventory-name-input") as HTMLInputElement;
        await user.clear(nameInput);
        await user.type(nameInput, "Neu");

        await user.click(screen.getByTestId("inventory-submit-button"));

        const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe("/api/proxy/items/item-2");
        expect(options.method).toBe("PUT");

        const body = JSON.parse(String(options.body));
        expect(body.inventoryCode).toBeUndefined();
    });
});
