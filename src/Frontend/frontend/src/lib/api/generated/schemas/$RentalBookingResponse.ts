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
                type: 'RentalBookingLineResponse',
            },
            isRequired: true,
        },
        borrowerName: {
            type: 'string',
            isRequired: true,
            isNullable: true,
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
