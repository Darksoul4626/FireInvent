/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateInventoryCategoryRequest } from '../models/CreateInventoryCategoryRequest';
import type { InventoryCategoryResponse } from '../models/InventoryCategoryResponse';
import type { UpdateInventoryCategoryRequest } from '../models/UpdateInventoryCategoryRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InventoryCategoriesService {
    /**
     * @returns InventoryCategoryResponse OK
     * @throws ApiError
     */
    public static getApiCategories(): CancelablePromise<Array<InventoryCategoryResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/categories',
        });
    }
    /**
     * @returns InventoryCategoryResponse OK
     * @throws ApiError
     */
    public static postApiCategories({
        requestBody,
    }: {
        requestBody: CreateInventoryCategoryRequest,
    }): CancelablePromise<InventoryCategoryResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/categories',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns InventoryCategoryResponse OK
     * @throws ApiError
     */
    public static getApiCategories1({
        id,
    }: {
        id: string,
    }): CancelablePromise<InventoryCategoryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns InventoryCategoryResponse OK
     * @throws ApiError
     */
    public static putApiCategories({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UpdateInventoryCategoryRequest,
    }): CancelablePromise<InventoryCategoryResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/categories/{id}',
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
    public static deleteApiCategories({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
        });
    }
}
