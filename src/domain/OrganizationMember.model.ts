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
        const query = await super.getQuery([['email', '==', email], ['organizationId', '==', organizationId], ['allowMethods', 'array-contains', method]])
        await super.checkQueryCount(query, {
            absolute: 1
        })
        const snapshot = await query.get()
        const impersonatedUid = snapshot.docs[0].data().uid
        return impersonatedUid
    }

    async setMember(uid: string, member: IOrganizationMember,) {
        const optoins: ICrudOptions = {
            merge: true,
            count: {
                absolute: 1
            }
        }
        const count = await super.setItemById(uid, String(member.id), member, optoins)
        return count
    }

    async deleteMember(uid: string, id: string,) {
        const count = await super.deleteItemsByQuery([['uid', '==', uid], ['id', '==', id]])
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
                fields: ['email', 'organizationId'],
                absolute: 0,
            }
        }
        const newMember = await super.createItem(uid, member, options)
        return newMember
    }
}