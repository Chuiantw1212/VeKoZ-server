export interface IOffer extends IOfferQuery {
    uid?: string,
    id?: string,
    name?: string,
    description?: string,
    inventoryValue?: number,
    showInventoryValue?: boolean,
    price?: number,
    eventName?: string,
    eventIsPublic?: boolean,
    categoryName?: string,
    offererName?: string,
    sellerName?: string,
    availableAtOrFrom?: string | 'VeKoZ',
}

export interface IOfferQuery {
    inventoryMaxValue?: number,
    categoryId?: string,
    eventId?: string,
    offererId?: string,
    offererIds?: string[] | string,
    sellerId?: string,
    validFrom?: any,
    validThrough?: any,
}