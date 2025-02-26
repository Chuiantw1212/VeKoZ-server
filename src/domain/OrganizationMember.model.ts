import VekozModel from '../adapters/VekozModel.out'
import type { IModelPorts } from '../ports/out.model'

export default class OrganizationMemberModel extends VekozModel{
    constructor(data: IModelPorts) {
        super(data)
    }

    async getMemberList(uid: string, organizationId: string) {
        const memberList = await super.getItemsByQuery([['uid', '==', uid], ['organizationId', '==', organizationId]])
        return memberList
    }
}