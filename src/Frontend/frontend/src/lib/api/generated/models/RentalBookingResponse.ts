/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RentalStatus } from './RentalStatus';
export type RentalBookingResponse = {
    id: string;
    itemId: string;
    startDate: string;
    endDate: string;
    quantity: number | string;
    status: RentalStatus;
    createdAt: string;
    updatedAt: string;
};

