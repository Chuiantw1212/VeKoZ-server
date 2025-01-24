import { Query, QuerySnapshot, CollectionReference, DocumentReference, DocumentData, Firestore } from 'firebase-admin/firestore'

export default class EventActor {
    collection: CollectionReference = null as any
    constructor(firestore: Firestore) {
        this.collection = firestore.collection('eventActors')
    }
}