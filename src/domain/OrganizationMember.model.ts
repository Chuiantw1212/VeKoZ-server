import Firestore from '../adapters/Firestore.out'
import type { IFirestoreAdapters } from '../entities/firestore'

export default class OrganizationMemberModel extends Firestore {
    constructor(data: IFirestoreAdapters) {
        super(data)
    }
}