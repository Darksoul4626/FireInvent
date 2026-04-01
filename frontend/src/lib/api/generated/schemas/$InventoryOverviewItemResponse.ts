/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $InventoryOverviewItemResponse = {
    properties: {
        id: {
            type: 'string',
            isRequired: true,
            format: 'uuid',
        },
        inventoryCode: {
            type: 'string',
            isRequired: true,
        },
        name: {
            type: 'string',
            isRequired: true,
        },
        category: {
            type: 'string',
            isRequired: true,
        },
        condition: {
            type: 'ItemCondition',
            isRequired: true,
        },
        location: {
            type: 'string',
            isRequired: true,
        },
        totalQuantity: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
        rented: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
        available: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
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
