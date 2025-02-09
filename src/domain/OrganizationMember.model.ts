import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IFirestoreAdapters } from '../entities/dataAccess'

export default class OrganizationMemberModel extends FirestoreAdapter{
    constructor(data: IFirestoreAdapters) {
        super(data)
    }

    async getMemberList(uid: string, organizationId: string) {
        const memberList = await super.getItemsByQuery([['uid', '==', uid], ['organizationId', '==', organizationId]])
        return memberList
    }
}