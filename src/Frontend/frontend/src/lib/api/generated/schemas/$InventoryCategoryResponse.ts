/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $InventoryCategoryResponse = {
    properties: {
        id: {
            type: 'string',
            isRequired: true,
            format: 'uuid',
        },
        name: {
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
