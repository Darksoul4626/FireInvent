import { test, expect } from "@playwright/test";
import { fillRentalDateRange, fillRentalQuantity } from "./utils/form-actions";
import { rowById, rowCellById } from "./utils/locators";

test("item create -> rent -> complete -> availability update", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const suffix = `${Date.now()}`;
    const itemCode = `E2E-${suffix}`;
    const itemName = `Generator ${suffix}`;
    let itemId = "";

    await page.goto("/inventory/new");

    await page.getByTestId("inventory-code-input").fill(itemCode);
    await page.getByTestId("inventory-name-input").fill(itemName);
    await page.getByTestId("inventory-category-input").fill("Power");
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
    await page.getByTestId("rental-item-select").selectOption({ label: createdItemLabel });

    const start = new Date("2099-01-10T09:00:00.000Z");
    const end = new Date("2099-01-10T18:00:00.000Z");
    await fillRentalDateRange(page, start, end);
    await fillRentalQuantity(page, 2);

    const createResponsePromise = page.waitForResponse((response) => {
        return response.url().includes("/api/proxy/rentals") && response.request().method() === "POST";
    });
    await page.getByTestId("rental-submit-button").click();

    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();
    const createdRental = (await createResponse.json()) as { id: string };

    await expect(page).toHaveURL(/\/rentals$/);

    const rentalRow = rowById(page, "rental-row", createdRental.id);
    await expect(rentalRow).toBeVisible();
    await expect(rowCellById(page, "rental-row", "rental-row-item", createdRental.id)).toContainText(createdItemLabel);
    await expect(rowCellById(page, "rental-row", "rental-row-status", createdRental.id)).toHaveText("Planned");

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
