import { Query, QuerySnapshot, CollectionReference, DocumentReference, DocumentData, Firestore } from 'firebase-admin/firestore'
import FirestoreDataAccess from './Firebase.model'

export default class EventTemplate extends FirestoreDataAccess {
    collection: CollectionReference = null as any
    constructor(firestore: Firestore) {
        super()
        this.collection = firestore.collection('eventTemplates')
    }
}