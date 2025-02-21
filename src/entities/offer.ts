export interface IOffer extends IOfferQuery {
    uid: string,
    id: string,
    name: string,
    inventoryValue: number,
    inventoryMaxValue: number,
    price: number,
    categoryName: string,
    eventName: string,
    offererName: string,
    sellerName: string,
    availableAtOrFrom: string | 'VeKoZ'
}

export interface IOfferQuery {
    categoryId?: string,
    eventId?: string,
    offererId?: string,
    sellerId?: string,
    validFrom?: any,
    validThrough?: any,
}