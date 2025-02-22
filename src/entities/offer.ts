export interface IOffer extends IOfferQuery {
    uid?: string,
    id?: string,
    name?: string,
    inventoryValue?: number,
    price?: number,
    eventName?: string,
    eventIsPublic?: boolean,
    categoryName?: string,
    offererName?: string,
    sellerName?: string,
    availableAtOrFrom?: string | 'VeKoZ'
}

export interface IOfferQuery {
    inventoryMaxValue?: number,
    categoryId?: string,
    eventId?: string,
    offererId?: string,
    sellerId?: string,
    validFrom?: any,
    validThrough?: any,
}