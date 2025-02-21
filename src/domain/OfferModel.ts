import FirestoreAdapter from '../adapters/Firestore.adapter'
import { IEvent } from '../entities/event'
import { IOffer } from '../entities/offer'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class OfferModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }

    async setOffers(uid: string, offers: IOffer[]) {
        const options: ICrudOptions = {
            merge: true,
            count: {
                absolute: 1
            }
        }
        const offerPromiese = offers.map(offer => {
            if (offer.id) {
                super.setItemById(uid, offer.id, offer, options)
                return offer.id
            } else {
                return super.createItem(uid, offer)
            }
        })
        const resultOffers = await Promise.all(offerPromiese) as IOffer[]
        const offerIds = resultOffers.map((offer: IOffer) => offer.id)
        return offerIds
    }

    async initOffersById(uid: string, event: IEvent) {
        const offerIds = event.offerIds
        const organizerId = event.organizerId
        const eventId = event.id
        if (!offerIds || !organizerId || !eventId) {
            return
        }
        const options: ICrudOptions = {
            merge: true,
            count: {
                absolute: 1
            }
        }
        offerIds.map((id: string) => {
            const result = super.setItemById(uid, id, {
                sellerId: organizerId,
                offererId: organizerId,
                eventId,
            }, options)
            return result
        })
    }

}