import FirestoreAdapter from '../adapters/Firestore.out'
import { IPlace } from '../entities/place'
import type { IModelPorts } from '../ports/out.model'

export default class PlaceModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }
    async createItem(uid: string, place: IPlace) {
        return super.createItem(uid, place)
    }
    async getPlaceById(uid: string, id: string): Promise<IPlace> {
        const items = await super.getItemsByQuery([['uid', '==', uid], ['id', '==', id]], {
            count: {
                absolute: 1
            }
        }) as IPlace[]
        return items[0]
    }
    async mergePlaceById(uid: string, id: string, place: IPlace) {
        const count = await super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], place, {
            merge: true,
            count: {
                absolute: 1
            }
        })
        return count
    }
    async getPlaceList() {
        const placeList = await super.getItemsByQuery([]) as IPlace[]
        return placeList
    }
    async deletePlaceById(uid: string, id: string) {
        const count = await super.deleteItemById(uid, id, {
            count: {
                range: [0, 1]
            }
        })
        return count
    }

}