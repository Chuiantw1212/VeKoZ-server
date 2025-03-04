import VekozModel from '../adapters/VekozModel.out'
import { IPagination } from '../entities/meta'
import { IOrganizationMember } from '../entities/organization'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class OrganizationMemberModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    async checkMemberAuths(email: string, organizationId: string, method: string) {
        const query = await super.getQuery([['email', '==', email], ['organizationId', '==', organizationId], ['auths', 'array-contains', method]])
        await super.checkQueryCount(query, {
            absolute: 1
        })
        const snapshot = await query.get()
        const impersonatedUid = snapshot.docs[0].data().uid
        return impersonatedUid
    }

    async deleteMember(uid: string, email: string,) {
        const count = await super.deleteItemsByQuery([['uid', '==', uid], ['email', '==', email]])
        return count
    }

    /**
     * 建立了 organizationId + lastmod index
     * @param uid 
     * @param organizationId 
     * @param pagination 
     * @returns 
     */
    async getMemberList(uid: string, organizationId: string, pagination: IPagination) {
        const options: ICrudOptions = {
            orderBy: ['lastmod', 'desc'],
            startAt: pagination.pageSize * (pagination.currentPage - 1),
            limit: pagination.pageSize,
        }
        const memberList = await super.getItemsByQuery([['uid', '==', uid], ['organizationId', '==', organizationId]], options)
        const query = await super.getQuery([['organizationId', '==', organizationId]])
        const count = await super.checkQueryCount(query, options?.count ?? {})
        return {
            total: count,
            items: memberList
        }
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