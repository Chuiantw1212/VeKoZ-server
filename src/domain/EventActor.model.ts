import { CollectionReference, Firestore } from 'firebase-admin/firestore'
import DataAccess from './DataAccess'

export default class EventActorModel extends DataAccess {
    collection: CollectionReference = null as any
    constructor(firestore: Firestore) {
        super()
        this.collection = firestore.collection('eventActors')
    }
}