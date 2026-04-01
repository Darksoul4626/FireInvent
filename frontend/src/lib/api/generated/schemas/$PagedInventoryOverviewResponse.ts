/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PagedInventoryOverviewResponse = {
    properties: {
        items: {
            type: 'array',
            contains: {
                type: 'InventoryOverviewItemResponse',
            },
            isRequired: true,
        },
        page: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
        pageSize: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
        totalCount: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
        totalPages: {
            type: 'number | string',
            isRequired: true,
            format: 'int32',
            pattern: '^-?(?:0|[1-9]\\d*)$',
        },
        hasPrevious: {
            type: 'boolean',
            isRequired: true,
        },
        hasNext: {
            type: 'boolean',
            isRequired: true,
        },
    },
} as const;
