import { CollectionReference, Firestore } from 'firebase-admin/firestore'
import DataAccess from './DataAccess'

export default class PlaceModel extends DataAccess {
    collection: CollectionReference = null as any
    publicPucket: any = null

    constructor(firestore: Firestore) {
        super()
        this.collection = firestore.collection('places')
    }
}