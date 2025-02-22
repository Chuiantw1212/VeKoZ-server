import FirestoreAdapter from '../adapters/Firestore.adapter'
import { IEvent } from '../entities/event'
import { IOffer, IOfferQuery } from '../entities/offer'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class OfferModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }

    async setOfferById(uid: string, id: string, data: IOfferQuery) {
        const options: ICrudOptions = {
            count: {
                absolute: 1,
            },
            merge: true,
        }
        return await super.setItemById(uid, id, data, options)
    }

    async deleteNotInCatrgory(uid: string, categoryId: string, offerIds: string[]) {
        const count = await super.deleteItemsByQuery([
            ['uid', '==', uid],
            ['categoryId', '==', categoryId],
            ['id', 'not-in', offerIds]
        ])
        return count
    }

    async updateOffersValidTime(uid: string, offerCategoryIds: string[], data: IOfferQuery) {
        const options: ICrudOptions = {
            count: {
                min: 1,
            },
            merge: true,
        }
        if (data.validFrom) {
            data.validFrom = super.formatTimestamp(data.validFrom)
        }
        if (data.validThrough) {
            data.validThrough = super.formatTimestamp(data.validThrough)
        }
        const promises = offerCategoryIds.map(async categoryId => {
            return await super.setItemsByQuery([['uid', '==', uid], ['categoryId', '==', categoryId]], data, options)
        })
        await Promise.all(promises)
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

    // async createOffers(uid: string, offers: IOffer[]): Promise<IOffer[]> {
    //     const offerPromiese = offers.map(offer => {
    //         offer.validFrom = super.formatTimestamp(offer.validFrom)
    //         offer.validThrough = super.formatTimestamp(offer.validThrough)
    //         return super.createItem(uid, offer)
    //     })
    //     const resultOffers = await Promise.all(offerPromiese) as IOffer[]
    //     return resultOffers
    // }

    async createOffer(uid: string, offer: IOffer,): Promise<IOffer> {
        if (offer.validFrom) {
            offer.validFrom = super.formatTimestamp(offer.validFrom)
        }
        if (offer.validThrough) {
            offer.validThrough = super.formatTimestamp(offer.validThrough)
        }
        return await super.createItem(uid, offer) as IOffer
    }
}