import VekozModel from '../adapters/VekozModel.out'
import { IOrganizationMember } from '../entities/organization'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class OrganizationMemberModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    async getMemberList(uid: string, organizationId: string) {
        const memberList = await super.getItemsByQuery([['uid', '==', uid], ['organizationId', '==', organizationId]])
        return memberList
    }

    async addMember(uid: string, member: IOrganizationMember) {
        const options: ICrudOptions = {
            count: {
                fields: ['email'],
                absolute: 0,
            }
        }
        const newMember = await super.createItem(uid, member, options)
        return newMember
    }
}