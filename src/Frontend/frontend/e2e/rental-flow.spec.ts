import { test, expect } from "@playwright/test";
import { fillRentalDateRange, fillRentalQuantity } from "./utils/form-actions";
import { rowById, rowCellById } from "./utils/locators";

test("item create -> rent -> complete -> availability update", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const suffix = `${Date.now()}`;
    const itemCode = `E2E-${suffix}`;
    const itemName = `Generator ${suffix}`;
    const categoryName = `E2E-CAT-${suffix}`;
    let itemId = "";

    const createCategoryResponse = await page.request.post("http://localhost:5153/api/categories", {
        data: { name: categoryName }
    });
    expect(createCategoryResponse.ok()).toBeTruthy();

    await page.goto("/inventory/new");

    await page.getByTestId("inventory-code-input").fill(itemCode);
    await page.getByTestId("inventory-name-input").fill(itemName);
    await page.getByTestId("inventory-category-select").selectOption(categoryName);
    await page.getByTestId("inventory-condition-select").selectOption("Good");
    await page.getByTestId("inventory-location-input").fill("Station A");
    await page.getByTestId("inventory-total-quantity-input").fill("3");

    const createItemResponsePromise = page.waitForResponse((response) => {
        return response.url().includes("/api/proxy/items") && response.request().method() === "POST";
    });
    await page.getByTestId("inventory-submit-button").click();

    const createdItem = (await (await createItemResponsePromise).json()) as { id: string };
    itemId = createdItem.id;

    await expect(page.getByTestId("inventory-detail-name")).toHaveText(itemName);
    await expect(page.getByTestId("availability-total")).toHaveText("3");

    await page.goto("/rentals/new");

    const createdItemLabel = `${itemCode} - ${itemName}`;
    await page.getByTestId("rental-item-select").selectOption(itemId);

    const day = (Number(suffix.slice(-2)) % 20) + 1;
    const dayPadded = String(day).padStart(2, "0");
    const start = new Date(`2099-02-${dayPadded}T09:00:00.000Z`);
    const end = new Date(`2099-02-${dayPadded}T18:00:00.000Z`);
    await fillRentalDateRange(page, start, end);
    await fillRentalQuantity(page, 1);

    const createResponsePromise = page.waitForResponse((response) => {
        return response.url().includes("/api/proxy/rentals") && response.request().method() === "POST";
    });
    await page.getByTestId("rental-submit-button").click();

    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();
    const createdRental = (await createResponse.json()) as {
        id: string;
        startDate: string;
        endDate: string;
        lines: Array<{ itemId: string; quantity: number }>;
        borrowerName: string | null;
    };

    await expect(page).toHaveURL(/\/rentals$/);

    const rentalRow = rowById(page, "rental-row", createdRental.id);
    await expect(rentalRow).toBeVisible();
    await expect(rowCellById(page, "rental-row", "rental-row-item", createdRental.id)).toContainText(createdItemLabel);
    await expect(rowCellById(page, "rental-row", "rental-row-status", createdRental.id)).toHaveText("Planned");

    const activateResponse = await page.request.put(
        `http://localhost:5153/api/rentals/${createdRental.id}`,
        {
            data: {
                startDate: createdRental.startDate,
                endDate: createdRental.endDate,
                lines: createdRental.lines,
                borrowerName: createdRental.borrowerName,
                status: 1
            }
        }
    );

    expect(activateResponse.ok()).toBeTruthy();

    const returnResponse = await page.request.post(
        `http://localhost:5153/api/rentals/${createdRental.id}/return`
    );

    expect(returnResponse.ok()).toBeTruthy();

    const completeResponse = await page.request.post(
        `http://localhost:5153/api/rentals/${createdRental.id}/complete`
    );

    expect(completeResponse.ok()).toBeTruthy();

    await page.goto("/inventory");
    const inventoryRow = rowById(page, "inventory-row", itemId);
    await expect(inventoryRow).toBeVisible();
    await expect(rowCellById(page, "inventory-row", "inventory-row-total", itemId)).toHaveText("3");
    await expect(rowCellById(page, "inventory-row", "inventory-row-rented", itemId)).toHaveText("0");
    await expect(rowCellById(page, "inventory-row", "inventory-row-available", itemId)).toHaveText("3");
});
