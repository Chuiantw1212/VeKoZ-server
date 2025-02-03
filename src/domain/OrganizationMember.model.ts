import { CollectionReference, Firestore } from 'firebase-admin/firestore'
import DataAccess from './DataAccess'

export default class OrganizationMemberModel extends DataAccess {
    collection: CollectionReference = null as any
    constructor(firestore: Firestore) {
        super()
        this.collection = firestore.collection('organizationMembers')
    }
}