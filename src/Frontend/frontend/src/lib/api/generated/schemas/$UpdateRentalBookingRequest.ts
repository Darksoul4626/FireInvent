/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $UpdateRentalBookingRequest = {
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
        quantity: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
    },
} as const;
