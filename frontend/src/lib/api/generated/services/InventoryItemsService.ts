/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateInventoryItemRequest } from '../models/CreateInventoryItemRequest';
import type { InventoryItemResponse } from '../models/InventoryItemResponse';
import type { PagedInventoryOverviewResponse } from '../models/PagedInventoryOverviewResponse';
import type { UpdateInventoryItemRequest } from '../models/UpdateInventoryItemRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InventoryItemsService {
    /**
     * @returns InventoryItemResponse OK
     * @throws ApiError
     */
    public static getApiItems(): CancelablePromise<Array<InventoryItemResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/items',
        });
    }
    /**
     * @returns InventoryItemResponse OK
     * @throws ApiError
     */
    public static postApiItems({
        requestBody,
    }: {
        requestBody: CreateInventoryItemRequest,
    }): CancelablePromise<InventoryItemResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/items',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns PagedInventoryOverviewResponse OK
     * @throws ApiError
     */
    public static getApiItemsOverview({
        page,
        pageSize,
        search,
        category,
        condition,
        at,
    }: {
        page?: number | string,
        pageSize?: number | string,
        search?: string,
        category?: string,
        condition?: string,
        at?: string,
    }): CancelablePromise<PagedInventoryOverviewResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/items/overview',
            query: {
                'Page': page,
                'PageSize': pageSize,
                'Search': search,
                'Category': category,
                'Condition': condition,
                'At': at,
            },
        });
    }
    /**
     * @returns InventoryItemResponse OK
     * @throws ApiError
     */
    public static getApiItems1({
        id,
    }: {
        id: string,
    }): CancelablePromise<InventoryItemResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/items/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns InventoryItemResponse OK
     * @throws ApiError
     */
    public static putApiItems({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UpdateInventoryItemRequest,
    }): CancelablePromise<InventoryItemResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/items/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiItems({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/items/{id}',
            path: {
                'id': id,
            },
        });
    }
}
