/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $CreateRentalBookingRequest = {
    properties: {
        startDate: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        endDate: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        lines: {
            type: 'array',
            contains: {
                type: 'RentalBookingLineRequest',
            },
            isRequired: true,
        },
        borrowerName: {
            type: 'string',
            isRequired: true,
            isNullable: true,
        },
    },
} as const;
