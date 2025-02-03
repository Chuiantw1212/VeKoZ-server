import { CollectionReference, Firestore } from 'firebase-admin/firestore'

export default class OrganizationRoleModel {
    protected collection: CollectionReference = null as any
    constructor(firestore: Firestore) {
        this.collection = firestore.collection('organizationRoles')
    }
}