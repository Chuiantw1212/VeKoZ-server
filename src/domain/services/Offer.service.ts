import OfferModel from '../OfferModel';
import type { IOffer, IOfferQuery } from '../../entities/offer';
import { ICrudOptions } from '../../ports/out.crud';
import EventModel from '../Event.model';

interface Idependency {
    offerModel: OfferModel
    eventModel: EventModel
}
export default class OfferService {
    private offerModel: OfferModel
    private eventModel: EventModel

    constructor(dependency: Idependency) {
        this.offerModel = dependency.offerModel
        this.eventModel = dependency.eventModel
    }

    async setOfferById(uid: string, id: string, offer: IOffer) {
        return await this.offerModel.setOfferById(uid, id, offer)
    }

    async queryOfferList(query: IOfferQuery) {
        const offers: IOffer[] = await this.offerModel.getOfferList(query)
        // offers.forEach(async offer => {
        //     const event = await this.eventModel.getEventById(String(offer.eventId))
        //     console.log({
        //         event
        //     })
        // })
        return offers
    }

    async setOffersByCategoryId(uid: string, categoryId: string, offer: IOffer) {
        return await this.offerModel.updateOfferGroupByCategoryId(uid, categoryId, offer)
    }
}