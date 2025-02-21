import FirestoreAdapter from '../adapters/Firestore.adapter'
import { IOffer } from '../entities/offer'
import type { IModelPorts } from '../ports/out.model'

export default class OfferModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }

    async createOffer(uid: string, offer: IOffer) {
        return await super.createItem(uid, offer)
    }
}