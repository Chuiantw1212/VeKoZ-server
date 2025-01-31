import { CollectionReference, Firestore } from 'firebase-admin/firestore'

export default class OrganizationMemberModel {
    collection: CollectionReference = null as any
    constructor(firestore: Firestore) {
        this.collection = firestore.collection('organizationMembers')
    }
}