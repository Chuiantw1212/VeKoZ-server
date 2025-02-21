import FirestoreAdapter from '../adapters/Firestore.adapter'
import { IOffer } from '../entities/offer'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class OfferModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }

    async createOffer(uid: string, offer: IOffer) {
        return await super.createItem(uid, offer)
    }

    async initOffersById(uid: string, offerIds: string[], organizationId: string) {
        const options: ICrudOptions = {
            merge: true,
            count: {
                absolute: 1
            }
        }
        offerIds.map((id: string) => {
            const result = super.setItemById(uid, id, {
                sellerId: organizationId,
                offerId: organizationId
            }, options)
            return result
        })
    }
}