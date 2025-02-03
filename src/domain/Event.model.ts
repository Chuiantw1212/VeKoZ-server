import { CollectionReference, Firestore } from 'firebase-admin/firestore'
import DataAccess from './DataAccess'

export default class EventModel extends DataAccess {
    collection: CollectionReference = null as any
    constructor(firestore: Firestore) {
        super({
            
        })
        this.collection = firestore.collection('events')
    }
}