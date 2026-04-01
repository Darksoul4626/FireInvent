/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RentalBookingLineResponse } from './RentalBookingLineResponse';
import type { RentalStatus } from './RentalStatus';
export type RentalBookingResponse = {
    id: string;
    startDate: string;
    endDate: string;
    lines: Array<RentalBookingLineResponse>;
    borrowerName: string | null;
    status: RentalStatus;
    createdAt: string;
    updatedAt: string;
};

