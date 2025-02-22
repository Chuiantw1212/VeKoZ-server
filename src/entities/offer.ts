export interface IOffer extends IOfferQuery {
    uid?: string,
    id?: string,
    name: string,
    inventoryValue: number,
    price: number,
    categoryName: string,
    offererName: string,
    sellerName: string,
    availableAtOrFrom: string | 'VeKoZ'
}

export interface IOfferQuery {
    eventName?: string,
    inventoryMaxValue?: number,
    categoryId?: string,
    eventId?: string,
    offererId?: string,
    sellerId?: string,
    validFrom?: any,
    validThrough?: any,
}