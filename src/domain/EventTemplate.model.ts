import { Query, QuerySnapshot, CollectionReference, DocumentReference, DocumentData, Firestore } from 'firebase-admin/firestore'

export default class EventTemplate {
    collection: CollectionReference = null as any
    constructor(firestore: Firestore) {
        this.collection = firestore.collection('eventTemplates')
    }
}