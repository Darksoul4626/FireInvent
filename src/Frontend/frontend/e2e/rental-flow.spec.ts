import { test, expect } from "@playwright/test";

function toInputDateTimeLocal(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

test("item create -> rent -> complete -> availability update", async ({ page }) => {
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

    await page.getByTestId("rental-item-select").selectOption({ label: `${itemCode} - ${itemName}` });

    const start = new Date(Date.now() - 15 * 60 * 1000);
    const end = new Date(Date.now() + 45 * 60 * 1000);
    await page.getByTestId("rental-start-input").fill(toInputDateTimeLocal(start));
    await page.getByTestId("rental-end-input").fill(toInputDateTimeLocal(end));
    await page.getByTestId("rental-quantity-input").fill("2");

    const createResponsePromise = page.waitForResponse((response) => {
        return response.url().includes("/api/proxy/rentals") && response.request().method() === "POST";
    });
    await page.getByTestId("rental-submit-button").click();

    const createResponse = await createResponsePromise;
    const createdRental = (await createResponse.json()) as { id: string };

    await expect(page).toHaveURL(/\/rentals$/);

    await expect(page.getByTestId(`rental-row-item-${createdRental.id}`)).toContainText(`${itemCode} - ${itemName}`);
    await expect(page.getByTestId(`rental-row-status-${createdRental.id}`)).toHaveText("Planned");

    const completeResponse = await page.request.post(
        `http://localhost:5153/api/rentals/${createdRental.id}/complete`
    );
    expect(completeResponse.ok()).toBeTruthy();

    await page.goto("/inventory");
    await expect(page.getByTestId(`inventory-row-total-${itemId}`)).toHaveText("3");
    await expect(page.getByTestId(`inventory-row-rented-${itemId}`)).toHaveText("0");
    await expect(page.getByTestId(`inventory-row-available-${itemId}`)).toHaveText("3");
});
