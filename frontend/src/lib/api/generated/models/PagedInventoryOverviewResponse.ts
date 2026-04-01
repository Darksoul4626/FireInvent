/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InventoryOverviewItemResponse } from './InventoryOverviewItemResponse';
export type PagedInventoryOverviewResponse = {
    items: Array<InventoryOverviewItemResponse>;
    page: number | string;
    pageSize: number | string;
    totalCount: number | string;
    totalPages: number | string;
    hasPrevious: boolean;
    hasNext: boolean;
};

