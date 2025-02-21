export interface IOffer extends IOfferQuery {
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
    uid: string,
    categoryId: string,
    eventId: string,
    offererId: string,
    sellerId: string,
    validFrom: any,
    validThrough: any,
}