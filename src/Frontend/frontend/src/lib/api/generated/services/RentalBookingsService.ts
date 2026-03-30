/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateRentalBookingRequest } from '../models/CreateRentalBookingRequest';
import type { RentalBookingResponse } from '../models/RentalBookingResponse';
import type { UpdateRentalBookingRequest } from '../models/UpdateRentalBookingRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RentalBookingsService {
    /**
     * @returns RentalBookingResponse OK
     * @throws ApiError
     */
    public static getApiRentals(): CancelablePromise<Array<RentalBookingResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/rentals',
        });
    }
    /**
     * @returns RentalBookingResponse OK
     * @throws ApiError
     */
    public static postApiRentals({
        requestBody,
    }: {
        requestBody: CreateRentalBookingRequest,
    }): CancelablePromise<RentalBookingResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/rentals',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns RentalBookingResponse OK
     * @throws ApiError
     */
    public static getApiRentals1({
        id,
    }: {
        id: string,
    }): CancelablePromise<RentalBookingResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/rentals/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns RentalBookingResponse OK
     * @throws ApiError
     */
    public static putApiRentals({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UpdateRentalBookingRequest,
    }): CancelablePromise<RentalBookingResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/rentals/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns RentalBookingResponse OK
     * @throws ApiError
     */
    public static postApiRentalsCancel({
        id,
    }: {
        id: string,
    }): CancelablePromise<RentalBookingResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/rentals/{id}/cancel',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns RentalBookingResponse OK
     * @throws ApiError
     */
    public static postApiRentalsReturn({
        id,
    }: {
        id: string,
    }): CancelablePromise<RentalBookingResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/rentals/{id}/return',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns RentalBookingResponse OK
     * @throws ApiError
     */
    public static postApiRentalsComplete({
        id,
    }: {
        id: string,
    }): CancelablePromise<RentalBookingResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/rentals/{id}/complete',
            path: {
                'id': id,
            },
        });
    }
}
