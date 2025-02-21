export interface IOffer extends IOfferQuery {
    id: string,
    name: string,
    inventoryValue: number,
    inventoryMaxValue: number,
    price: number,
}

export interface IOfferQuery {
    uid: string,
    sellerId: string,
    offererId: string,
    eventId: string,
}