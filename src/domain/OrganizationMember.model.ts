import VekozModel from '../adapters/VekozModel.out'
import { IPagination } from '../entities/meta'
import { IOrganizationMember, IOrganizationMemberQuery } from '../entities/organization'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class OrganizationMemberModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }
    /**
     * C
     * @param uid 
     * @param member 
     * @returns 
     */
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

    /**
     * R 取得用戶所屬組織權限列表
     * @param email 
     * @param memberQuery 
     * @returns 
     */
    async getRelatedMembershipss(email: string, memberQuery: IOrganizationMemberQuery) {
        const options: ICrudOptions = {
            orderBy: ['lastmod', 'desc'],
            startAfter: Number(memberQuery.pageSize) * (Number(memberQuery.currentPage) - 1),
            limit: Number(memberQuery.pageSize),
        }

        let allowMethod = 'GET'
        if (Array.isArray(memberQuery.allowMethods)) {
            allowMethod = memberQuery.allowMethods[0]
        } else {
            allowMethod = memberQuery.allowMethods ?? 'GET'
        }

        const wheres = []
        if (allowMethod) {
            wheres.push(['allowMethods', 'array-contains', allowMethod])
        }
        if (email) {
            wheres.push(['email', '==', email])
        }
        if (memberQuery.organizationId) {
            wheres.push(['organizationId', '==', memberQuery.organizationId])
        }
        if (memberQuery.organizationIds) {
            if (typeof memberQuery.organizationIds === 'string') {
                const organizationIds = String(memberQuery.organizationIds).split(',')
                wheres.push(['organizationId', 'in', organizationIds])
            }
        }
        const query = await super.getQuery(wheres)
        const count = await super.checkQueryCount(query, options?.count ?? {})
        const querySnapshot = await query.get()
        const items = querySnapshot.docs.map(doc => {
            const data = doc.data()
            data.lastmod = super.formatDate(data.lastmod)
            return data
        })
        return {
            total: count,
            items,
        }
    }

    /**
     * R 打開組織列表
     * @param member 
     * @param pagination 
     * @returns 
     */
    async getMemberListByQuery(member: IOrganizationMember, pagination?: IPagination) {
        const options: ICrudOptions = {
            orderBy: ['lastmod', 'desc'],
        }
        if (pagination) {
            const { pageSize, currentPage } = pagination
            if (pageSize && currentPage) {
                options.startAfter = Number(pagination.pageSize) * (Number(pagination.currentPage) - 1)
                options.limit = Number(pagination.pageSize)
            }
        }
        const wheres = []
        if (member.uid) {
            wheres.push(['uid', '==', member.uid])
        }
        if (member.organizationId) {
            wheres.push(['organizationId', '==', member.organizationId])
        }
        if (member.organizationIds) {
            if (typeof member.organizationIds === 'string') {
                const organizationIds = String(member.organizationIds).split(',')
                wheres.push(['organizationId', 'in', organizationIds])
            }
        }
        if (member.email) {
            wheres.push(['email', '==', member.email])
        }
        const query = await super.getQuery(wheres)
        const count = await super.checkQueryCount(query, options?.count ?? {})
        const memberList = await super.getItemsByQuery(wheres, options)
        return {
            total: count,
            items: memberList
        }
    }

    /**
     * R
     * @param email 
     * @param organizationId 
     * @param method 
     * @returns 
     */
    async getMemberByQuery(member: IOrganizationMemberQuery): Promise<IOrganizationMember> {
        if (!member.organizationId) {
            throw '組織Id未提供'
        }
        const { email, organizationId, allowMethods, allowEntities } = member
        const wheres: [string, string, any][] = [['email', '==', email], ['organizationId', '==', organizationId],]
        if (allowMethods) {
            if (Array.isArray(allowMethods)) {
                wheres.push(['allowMethods', 'array-contains-any', allowMethods])
            } else {
                wheres.push(['allowMethods', 'array-contains-any', [allowMethods]])
            }
        }
        if (allowEntities) {
            wheres.push(['allowEntities', 'array-contains-any', allowEntities])
        }
        const query = await super.getQuery(wheres)
        await super.checkQueryCount(query, {
            range: [0, 1]
        })
        const snapshot = await query.get()
        if (snapshot.docs[0]) {
            const impersonatedMember = snapshot.docs[0].data() as IOrganizationMember
            return impersonatedMember
        } else {
            return {}
        }
    }

    /**
     * U
     * @param member 
     */
    async acceptInvitation(member: IOrganizationMember) {
        const options: ICrudOptions = {
            merge: true,
        }
        super.setItemsByQuery([['email', '==', member.email]], member, options)
    }

    /**
     * U：變更單一資料時使用
     * @param uid 
     * @param member 
     * @returns 
     */
    async setMemberById(uid: string, member: IOrganizationMember,) {
        if (!member.organizationId || !member.id) {
            throw 'setMemberById資料不全'
        }
        const options: ICrudOptions = {
            merge: true,
            count: {
                absolute: 1
            }
        }
        const wheres = [['uid', '==', uid], ['id', '==', member.id], ['organizationId', '==', member.organizationId]]
        const count = await super.setItemsByQuery(wheres, member, options)
        return count
    }

    /**
     * U: 資料連動更新時使用
     * @param uid 
     * @param member 
     * @returns 
     */
    async setMembersByOrgnaizationId(uid: string, member: IOrganizationMember,) {
        if (!member.organizationId) {
            throw `未提供organizationId`
        }
        const options: ICrudOptions = {
            merge: true,
        }
        const wheres = [['uid', '==', uid], ['organizationId', '==', member.organizationId],]
        const count = await super.setItemsByQuery(wheres, member, options)
        return count
    }

    /**
     * D
     * @param member 
     * @returns 
     */
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

    /**
     * D
     * @param member 
     * @returns 
     */
    async deleteSelfByEmail(member: IOrganizationMember) {
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
     * D
     * @param uid 
     * @param organizationId 
     * @returns 
     */
    async deleteByOrganizationId(uid: string, organizationId: string,) {
        const count = await super.deleteItemsByQuery([
            ['uid', '==', uid], ['organizationId', '==', organizationId]
        ],)
        return count
    }
}