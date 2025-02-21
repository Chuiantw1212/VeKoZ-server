import FirestoreAdapter from '../adapters/Firestore.adapter'
import { IEvent } from '../entities/event'
import { IOffer } from '../entities/offer'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class OfferModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }

    async deleteOffers(uid: string, eventId: string): Promise<number> {
        const offers = await super.getItemsByQuery([['uid', '==', uid], ['eventId', '==', eventId]])
        const isNotSaled = offers.every((offer) => {
            return offer.inventoryValue === offer.inventoryValue
        })
        if (isNotSaled) {
            const promises = offers.map((offer) => {
                return super.deleteItemById(uid, offer.id)
            })
            const ones = await Promise.all(promises)
            const successOnes = ones.filter(one => !!one)
            return successOnes.length
        } else {
            return 0
        }
    }

    async getOfferList(uid: string): Promise<IOffer[]> {
        const offers: IOffer[] = await super.getItemsByQuery([['uid', '==', uid]]) as IOffer[]
        offers.forEach(offer => {
            offer.validFrom = super.formatDate(offer.validFrom)
            offer.validThrough = super.formatDate(offer.validThrough)
        })
        return offers
    }

    async createOffers(uid: string, offers: IOffer[]): Promise<IOffer[]> {
        const offerPromiese = offers.map(offer => {
            offer.validFrom = super.formatTimestamp(offer.validFrom)
            offer.validThrough = super.formatTimestamp(offer.validThrough)
            return super.createItem(uid, offer)
        })
        const resultOffers = await Promise.all(offerPromiese) as IOffer[]
        return resultOffers
    }

    // async initOffersById(uid: string, event: IEvent) {
    //     const offerIds = event.offerIds
    //     const organizerId = event.organizerId
    //     const eventId = event.id
    //     const eventName = event.name
    //     const organizerName = event.organizerName
    //     const eventStartDate = event.startDate as string
    //     const eventEndDate = event.endDate as string
    //     if (!offerIds || !organizerId || !eventId) {
    //         return
    //     }
    //     const options: ICrudOptions = {
    //         merge: true,
    //         count: {
    //             absolute: 1
    //         }
    //     }
    //     offerIds.map((id: string) => {
    //         const result = super.setItemById(uid, id, {
    //             sellerId: organizerId,
    //             sellerName: organizerName,
    //             offererId: organizerId,
    //             offererName: organizerName,
    //             eventId,
    //             eventName,
    //             validFrom: super.formatTimestamp(eventStartDate),
    //             validThrough: super.formatTimestamp(eventEndDate),
    //         }, options)
    //         return result
    //     })
    // }
}