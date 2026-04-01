/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RentalStatus } from './RentalStatus';
export type RentalOverviewItemResponse = {
    id: string;
    startDate: string;
    endDate: string;
    borrowerName: string | null;
    status: RentalStatus;
    totalQuantity: number | string;
    itemSummary: string;
    createdAt: string;
    updatedAt: string;
};

