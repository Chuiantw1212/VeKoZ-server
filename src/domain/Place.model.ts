import Firestore from '../adapters/Firestore.out'
import type { IFirestoreAdapters } from '../entities/dataAccess'

export default class PlaceModel extends Firestore {
    constructor(data: IFirestoreAdapters) {
        super(data)
    }
}