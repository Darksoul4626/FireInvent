/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ItemAvailabilityResponse } from '../models/ItemAvailabilityResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AvailabilityService {
    /**
     * @returns ItemAvailabilityResponse OK
     * @throws ApiError
     */
    public static getApiItemsAvailability({
        itemId,
        from,
        to,
    }: {
        itemId: string,
        from?: string,
        to?: string,
    }): CancelablePromise<ItemAvailabilityResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/items/{itemId}/availability',
            path: {
                'itemId': itemId,
            },
            query: {
                'From': from,
                'To': to,
            },
        });
    }
}
