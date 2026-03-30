import type { Page } from "@playwright/test";

export function rowById(page: Page, prefix: string, id: string) {
    return page.getByTestId(`${prefix}-${id}`);
}

export function rowCellById(page: Page, rowPrefix: string, cellPrefix: string, id: string) {
    return rowById(page, rowPrefix, id).getByTestId(`${cellPrefix}-${id}`);
}