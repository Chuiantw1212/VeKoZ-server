import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IModelPorts } from '../ports/out.model'

export default class EventActorModel extends FirestoreAdapter {
    constructor(data: IModelPorts) {
        super(data)
    }
}