import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IModelPorts } from '../ports/out.model'

export default class OrganizationMemberModel extends FirestoreAdapter{
    constructor(data: IModelPorts) {
        super(data)
    }

    async getMemberList(uid: string, organizationId: string) {
        const memberList = await super.getItemsByQuery([['uid', '==', uid], ['organizationId', '==', organizationId]])
        return memberList
    }
}