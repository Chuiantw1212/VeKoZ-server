import { CollectionReference, Firestore } from 'firebase-admin/firestore'
import DataAccess from './DataAccess'

export default class EventTodoModel extends DataAccess {
    // collection: CollectionReference = null as any
    constructor(firestore: Firestore) {
        super(firestore.collection('eventTodos'))
    }
}