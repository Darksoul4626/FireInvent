/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RentalBookingLineRequest } from './RentalBookingLineRequest';
export type CreateRentalBookingRequest = {
    startDate: string;
    endDate: string;
    lines: Array<RentalBookingLineRequest>;
    borrowerName: string | null;
};

