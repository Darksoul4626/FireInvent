import { expect, test } from "@playwright/test";

test("overview query state and rental pre-validation flow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto("/inventory");
    await page.getByTestId("inventory-overview-search").fill("Gen");
    await page.waitForTimeout(400);
    await expect(page).toHaveURL(/search=Gen/);

    await page.getByTestId("inventory-overview-condition").selectOption("Good");
    await expect(page).toHaveURL(/condition=Good/);

    const categoryName = `E2E-INLINE-${Date.now()}`;
    await page.goto("/inventory/new");
    await page.getByTestId("inventory-category-select").fill(categoryName);

    const createCategoryResponsePromise = page.waitForResponse((response) => {
        return response.url().includes("/api/proxy/categories") && response.request().method() === "POST";
    });

    await page.getByTestId("inventory-category-create-inline").click();
    const createCategoryResponse = await createCategoryResponsePromise;
    expect(createCategoryResponse.ok()).toBeTruthy();

    const itemSuffix = `${Date.now()}`;
    const createItemResponse = await page.request.post("http://localhost:5153/api/items", {
        data: {
            inventoryCode: `E2E-PRE-${itemSuffix}`,
            name: `Prevalidation Item ${itemSuffix}`,
            category: categoryName,
            condition: 1,
            location: "Station C",
            totalQuantity: 1
        }
    });
    expect(createItemResponse.ok()).toBeTruthy();
    const createdItem = (await createItemResponse.json()) as { id: string };

    await page.goto("/rentals/new");
    const rentalItemSelect = page.getByTestId("rental-item-select");
    await expect(page.locator(`[data-testid="rental-item-select"] option[value="${createdItem.id}"]`)).toHaveCount(1);
    await rentalItemSelect.selectOption(createdItem.id);
    await page.getByTestId("rental-start-input").fill("2000-01-01");
    await page.getByTestId("rental-end-input").fill("2000-01-02");
    await page.getByTestId("rental-quantity-input").fill("1");
    await page.keyboard.press("Tab");

    await expect(page.getByTestId("rental-start-berlin-error")).toBeVisible();
    await expect(page.getByTestId("rental-submit-button")).toBeDisabled();
});
