import type { Page } from "@playwright/test";

export function toInputDate(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
}

export async function fillRentalDateRange(page: Page, start: Date, end: Date) {
    await page.getByTestId("rental-start-input").fill(toInputDate(start));
    await page.getByTestId("rental-end-input").fill(toInputDate(end));
}

export async function fillRentalQuantity(page: Page, quantity: number) {
    await page.getByTestId("rental-quantity-input").fill(String(quantity));
}