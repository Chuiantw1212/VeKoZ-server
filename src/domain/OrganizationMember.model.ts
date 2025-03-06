import VekozModel from '../adapters/VekozModel.out'
import { IPagination } from '../entities/meta'
import { IOrganizationMember } from '../entities/organization'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class OrganizationMemberModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    async getRelatedMemberships(email: string, pagination: IPagination) {
        const options: ICrudOptions = {
            orderBy: ['lastmod', 'desc'],
            startAt: Number(pagination.pageSize) * (Number(pagination.currentPage) - 1),
            limit: Number(pagination.pageSize),
        }
        const members: IOrganizationMember[] = await super.getItemsByWheres(
            [['email', '==', email], ['allowMethods', 'array-contains', 'GET']],
            options
        ) as IOrganizationMember[]
        return members
    }

    async acceptInvitation(member: IOrganizationMember) {
        const options: ICrudOptions = {
            merge: true,
        }
        super.setItemsByQuery([['email', '==', member.email]], member, options)
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

    async setMemberById(uid: string, member: IOrganizationMember,) {
        const optoins: ICrudOptions = {
            merge: true,
            count: {
                absolute: 1
            }
        }
        const count = await super.setItemById(uid, String(member.id), member, optoins)
        return count
    }

    async deleteMemberById(member: IOrganizationMember) {
        const options: ICrudOptions = {
            count: {
                absolute: 1
            }
        }
        const count = await super.deleteItemsByQuery([
            ['uid', '==', member.uid], ['id', '==', member.id], ['organizationId', '==', member.organizationId]
        ], options)
        return count
    }

    async deleteMemberByEmail(member: IOrganizationMember) {
        const options: ICrudOptions = {
            count: {
                absolute: 1
            }
        }
        const count = await super.deleteItemsByQuery([
            ['uid', '==', member.uid], ['email', '==', member.email], ['organizationId', '==', member.organizationId]
        ], options)
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
            startAt: Number(pagination.pageSize) * (Number(pagination.currentPage) - 1),
            limit: Number(pagination.pageSize),
        }
        const wheres = [['uid', '==', uid], ['organizationId', '==', organizationId]]
        const query = await super.getQuery(wheres)
        const count = await super.checkQueryCount(query, options?.count ?? {})
        const memberList = await super.getItemsByWheres(wheres, options)
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