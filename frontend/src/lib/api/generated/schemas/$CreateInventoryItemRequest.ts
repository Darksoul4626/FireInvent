/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $CreateInventoryItemRequest = {
    properties: {
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
    },
} as const;
