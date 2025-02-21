export interface IOffer extends IOfferQuery {
    id: string,
    name: string,
    sku: number,
    price: number,
}

export interface IOfferQuery {
    uid: string,
    sellerId: string,
    offererId: string,
    eventId: string,
}