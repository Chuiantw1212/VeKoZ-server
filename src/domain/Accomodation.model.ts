import { CollectionReference, Firestore } from 'firebase-admin/firestore'
import FirestoreDataAccess from './Firebase.model'

export default class Accomodation extends FirestoreDataAccess {
    collection: CollectionReference = null as any
    publicPucket: any = null

    constructor(firestore: Firestore) {
        super()
        this.collection = firestore.collection('accomodations')
    }
}