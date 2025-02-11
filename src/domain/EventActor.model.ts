import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IFirestoreAdapters } from '../entities/dataAccess'

export default class EventActorModel extends FirestoreAdapter{
    constructor(data: IFirestoreAdapters) {
        super(data)
    }
}