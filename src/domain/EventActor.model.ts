import Firestore from './Firestore.out'
import type { IFirestoreAdapters } from '../entities/firestore'

export default class EventActorModel extends Firestore {
    constructor(data: IFirestoreAdapters) {
        super(data)
    }
}