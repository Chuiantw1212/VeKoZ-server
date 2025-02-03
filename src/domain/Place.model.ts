import { CollectionReference, Firestore } from 'firebase-admin/firestore'
import FirebaseDataAccess from './Firebase.model'

export default class PlaceModel extends FirebaseDataAccess {
    collection: CollectionReference = null as any
    publicPucket: any = null

    constructor(firestore: Firestore) {
        super()
        this.collection = firestore.collection('places')
    }
}