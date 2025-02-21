export interface IOffer {
    id: string,
    name: string,
    sku: number,
    price: number,
    sellerId: string,
    offererId: string, // organizationId
}