/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RentalBookingResponse = {
    properties: {
        id: {
            type: 'string',
            isRequired: true,
            format: 'uuid',
        },
        itemId: {
            type: 'string',
            isRequired: true,
            format: 'uuid',
        },
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
        status: {
            type: 'RentalStatus',
            isRequired: true,
        },
        createdAt: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        updatedAt: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
    },
} as const;
