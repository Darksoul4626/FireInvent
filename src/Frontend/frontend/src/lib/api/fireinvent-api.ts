import {
    AvailabilityService,
    InventoryItemsService,
    RentalBookingsService,
    type InventoryItemResponse as GeneratedInventoryItem,
    type ItemAvailabilityResponse as GeneratedItemAvailability,
    type RentalBookingResponse as GeneratedRentalBooking
} from "@/lib/api/generated";
import { configureOpenApiClient, getApiBaseUrl } from "@/lib/api/openapi-client";

export type ItemCondition = "Unknown" | "Good" | "NeedsRepair" | "OutOfService";
export type RentalStatus = "Planned" | "Active" | "Canceled" | "Completed";

export interface InventoryItemDto {
    id: string;
    inventoryCode: string;
    name: string;
    category: string;
    condition: ItemCondition;
    location: string;
    totalQuantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface RentalBookingDto {
    id: string;
    itemId: string;
    startDate: string;
    endDate: string;
    quantity: number;
    status: RentalStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ItemAvailabilityDto {
    itemId: string;
    totalQuantity: number;
    reservedOrRentedQuantity: number;
    availableQuantity: number;
    from: string;
    to: string;
}

export const apiBaseUrl = getApiBaseUrl();

configureOpenApiClient();

function toNumber(value: number | string): number {
    return typeof value === "number" ? value : Number(value);
}

function toItemCondition(value: number): ItemCondition {
    switch (value) {
        case 0:
            return "Unknown";
        case 1:
            return "Good";
        case 2:
            return "NeedsRepair";
        case 3:
            return "OutOfService";
        default:
            return "Unknown";
    }
}

function toRentalStatus(value: number): RentalStatus {
    switch (value) {
        case 0:
            return "Planned";
        case 1:
            return "Active";
        case 2:
            return "Canceled";
        case 3:
            return "Completed";
        default:
            return "Planned";
    }
}

function mapInventoryItem(dto: GeneratedInventoryItem): InventoryItemDto {
    return {
        id: dto.id,
        inventoryCode: dto.inventoryCode,
        name: dto.name,
        category: dto.category,
        condition: toItemCondition(dto.condition),
        location: dto.location,
        totalQuantity: toNumber(dto.totalQuantity),
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt
    };
}

function mapRentalBooking(dto: GeneratedRentalBooking): RentalBookingDto {
    return {
        id: dto.id,
        itemId: dto.itemId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        quantity: toNumber(dto.quantity),
        status: toRentalStatus(dto.status),
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt
    };
}

function mapItemAvailability(dto: GeneratedItemAvailability): ItemAvailabilityDto {
    return {
        itemId: dto.itemId,
        totalQuantity: toNumber(dto.totalQuantity),
        reservedOrRentedQuantity: toNumber(dto.reservedOrRentedQuantity),
        availableQuantity: toNumber(dto.availableQuantity),
        from: dto.from,
        to: dto.to
    };
}

export async function getInventoryItems(): Promise<InventoryItemDto[]> {
    const response = await InventoryItemsService.getApiItems();
    return response.map(mapInventoryItem);
}

export async function getInventoryItem(id: string): Promise<InventoryItemDto> {
    const response = await InventoryItemsService.getApiItems1({ id });
    return mapInventoryItem(response);
}

export async function getRentalBookings(): Promise<RentalBookingDto[]> {
    const response = await RentalBookingsService.getApiRentals();
    return response.map(mapRentalBooking);
}

export async function getRentalBooking(id: string): Promise<RentalBookingDto> {
    const response = await RentalBookingsService.getApiRentals1({ id });
    return mapRentalBooking(response);
}

export async function getItemAvailability(itemId: string, at: Date): Promise<ItemAvailabilityDto> {
    const when = at.toISOString();
    const response = await AvailabilityService.getApiItemsAvailability({
        itemId,
        from: when,
        to: when
    });
    return mapItemAvailability(response);
}
