import Firestore from '../adapters/Firestore.out'
import type { IFirestoreAdapters } from '../entities/dataAccess'

export default class OrganizationMemberModel extends Firestore {
    constructor(data: IFirestoreAdapters) {
        super(data)
    }
}