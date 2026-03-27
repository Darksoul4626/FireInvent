/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ItemCondition } from './ItemCondition';
export type CreateInventoryItemRequest = {
    inventoryCode: string;
    name: string;
    category: string;
    condition: ItemCondition;
    location: string;
    totalQuantity: number | string;
};

