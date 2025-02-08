import Firestore from '../adapters/Firestore.out'
import type { IFirestoreAdapters } from '../entities/dataAccess'

export default class OrganizationMemberModel extends Firestore {
    constructor(data: IFirestoreAdapters) {
        super(data)
    }

    async getMemberList(uid: string, organizationId: string) {
        const memberList = await super.getItemsByQuery([['uid', '==', uid], ['organizationId', '==', organizationId]])
        return memberList
    }
}