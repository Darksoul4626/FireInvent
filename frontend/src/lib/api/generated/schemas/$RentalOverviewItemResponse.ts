/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RentalOverviewItemResponse = {
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
        borrowerName: {
            type: 'string',
            isRequired: true,
            isNullable: true,
        },
        status: {
            type: 'RentalStatus',
            isRequired: true,
        },
        totalQuantity: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
        itemSummary: {
            type: 'string',
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
