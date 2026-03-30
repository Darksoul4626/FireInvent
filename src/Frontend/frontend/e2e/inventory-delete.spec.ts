import { expect, test } from "@playwright/test";
import { rowById } from "./utils/locators";

test.describe("inventory delete workflow", () => {
    test("deletes an unlinked inventory item from overview", async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });

        const suffix = `${Date.now()}`;
        const categoryName = `E2E-DEL-CAT-${suffix}`;
        const inventoryCode = `E2E-DEL-${suffix}`;

        const createCategoryResponse = await page.request.post("http://localhost:5153/api/categories", {
            data: { name: categoryName }
        });
        expect(createCategoryResponse.ok()).toBeTruthy();

        const createItemResponse = await page.request.post("http://localhost:5153/api/items", {
            data: {
                inventoryCode,
                name: `Delete Candidate ${suffix}`,
                category: categoryName,
                condition: 1,
                location: "Station A",
                totalQuantity: 1
            }
        });
        expect(createItemResponse.ok()).toBeTruthy();
        const createdItem = (await createItemResponse.json()) as { id: string };

        await page.goto("/inventory");

        const row = rowById(page, "inventory-row", createdItem.id);
        await expect(row).toBeVisible();

        const deleteResponsePromise = page.waitForResponse((response) => {
            return response.url().includes(`/api/proxy/items/${createdItem.id}`) && response.request().method() === "DELETE";
        });

        page.once("dialog", (dialog) => {
            void dialog.accept();
        });
        await row.getByTestId(`inventory-delete-button-${createdItem.id}`).click();

        const deleteResponse = await deleteResponsePromise;
        expect(deleteResponse.status()).toBe(204);

        await expect(rowById(page, "inventory-row", createdItem.id)).toHaveCount(0);
    });

    test("shows conflict feedback when deleting item with rental history", async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });

        const suffix = `${Date.now()}`;
        const categoryName = `E2E-CONFLICT-CAT-${suffix}`;

        const createCategoryResponse = await page.request.post("http://localhost:5153/api/categories", {
            data: { name: categoryName }
        });
        expect(createCategoryResponse.ok()).toBeTruthy();

        const createItemResponse = await page.request.post("http://localhost:5153/api/items", {
            data: {
                inventoryCode: `E2E-CONFLICT-${suffix}`,
                name: `Conflict Candidate ${suffix}`,
                category: categoryName,
                condition: 1,
                location: "Station B",
                totalQuantity: 3
            }
        });
        expect(createItemResponse.ok()).toBeTruthy();
        const createdItem = (await createItemResponse.json()) as { id: string };

        const createRentalResponse = await page.request.post("http://localhost:5153/api/rentals", {
            data: {
                startDate: "2099-03-10T08:00:00.000Z",
                endDate: "2099-03-11T18:00:00.000Z",
                lines: [{ itemId: createdItem.id, quantity: 1 }],
                borrowerName: "E2E Conflict"
            }
        });
        expect(createRentalResponse.ok()).toBeTruthy();

        await page.goto("/inventory");

        const row = rowById(page, "inventory-row", createdItem.id);
        await expect(row).toBeVisible();

        const deleteResponsePromise = page.waitForResponse((response) => {
            return response.url().includes(`/api/proxy/items/${createdItem.id}`) && response.request().method() === "DELETE";
        });

        page.once("dialog", (dialog) => {
            void dialog.accept();
        });
        await row.getByTestId(`inventory-delete-button-${createdItem.id}`).click();

        const deleteResponse = await deleteResponsePromise;
        expect([409, 500]).toContain(deleteResponse.status());

        await expect(row).toBeVisible();
        await expect(row.getByTestId(`inventory-delete-error-${createdItem.id}`)).toContainText(/cannot|geloescht|rental/i);
    });
});
