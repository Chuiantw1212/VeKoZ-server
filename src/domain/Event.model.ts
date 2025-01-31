import { CollectionReference, Firestore } from 'firebase-admin/firestore'
import FirestoreDataAccess from './Firebase.model'

export default class EventModel extends FirestoreDataAccess {
    collection: CollectionReference = null as any
    constructor(firestore: Firestore) {
        super()
        this.collection = firestore.collection('events')
    }
}