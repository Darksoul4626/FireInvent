/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ItemAvailabilityResponse = {
    properties: {
        itemId: {
            type: 'string',
            isRequired: true,
            format: 'uuid',
        },
        totalQuantity: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
        reservedOrRentedQuantity: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
        availableQuantity: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
        from: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        to: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
    },
} as const;
