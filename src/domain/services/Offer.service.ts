import OfferModel from '../OfferModel';
import type { IOffer } from '../../entities/offer';
import { ICrudOptions } from '../../ports/out.crud';

interface Idependency {
    offerModel: OfferModel;
}
export default class OfferService {
    protected offerModel: OfferModel

    constructor(dependency: Idependency) {
        const {
            offerModel,
        } = dependency
        this.offerModel = offerModel
    }

    async queryOfferList(uid: string) {
        return await this.offerModel.getOfferList(uid)
    }
}