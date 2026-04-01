/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RentalOverviewItemResponse } from './RentalOverviewItemResponse';
export type PagedRentalOverviewResponse = {
    items: Array<RentalOverviewItemResponse>;
    page: number | string;
    pageSize: number | string;
    totalCount: number | string;
    totalPages: number | string;
    hasPrevious: boolean;
    hasNext: boolean;
};

