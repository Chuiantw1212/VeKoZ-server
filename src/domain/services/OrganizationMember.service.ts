import OrganizationMemberModel from '../OrganizationMember.model';
import type { IOrganization, IOrganizationMember, IOrganizationMemberQuery } from '../../entities/organization';
import EmailAdapter from '../../adapters/email.out';
import OrganizationModel from '../Organization.model';
import UserModel from '../User.model';
import { IPagination } from '../../entities/meta';
import { IUser } from '../../entities/user';

interface Idependency {
    emailAdapter: EmailAdapter,
    organizationModel: OrganizationModel
    organizationMemberModel: OrganizationMemberModel
    userModel: UserModel
}

export default class OrganizationMemberService {
    protected organizationMemberModel: OrganizationMemberModel
    private organizaitonModel: OrganizationModel
    private emailAdapter: EmailAdapter
    private userModel: UserModel

    constructor(dependency: Idependency) {
        this.emailAdapter = dependency.emailAdapter
        this.organizaitonModel = dependency.organizationModel
        this.organizationMemberModel = dependency.organizationMemberModel
        this.userModel = dependency.userModel
    }

    async getRelatedMembership(email: string, memberQuery: IOrganizationMemberQuery) {
        const members = await this.organizationMemberModel.getRelatedMemberships(email, memberQuery)
        return members
    }

    joinRelatedOrganization(member: IOrganizationMember) {
        this.organizationMemberModel.acceptInvitation(member)
    }

    async directAddHost(uid: string, member: IOrganizationMember,) {
        const count = await this.organizationMemberModel.addMember(uid, member)
        return count
    }

    async setMemberById(uid: string, member: IOrganizationMember,) {
        const count = await this.organizationMemberModel.setMemberById(uid, member)
        return count
    }

    async deleteMemberById(member: IOrganizationMember) {
        const count = await this.organizationMemberModel.deleteMemberById(member)
        return count
    }

    async deleteSelfByEmail(member: IOrganizationMember) {
        const count = await this.organizationMemberModel.deleteSelfByEmail(member)
        return count
    }

    async checkMemberAuths(email: string, organizationId: string, method: string) {
        return await this.organizationMemberModel.checkMemberAuths(email, organizationId, method)
    }

    /**
     * 取得成員列表
     * @param uid 使用者uid
     * @param organizationId 企業文件Id
     * @returns 
     */
    async getMemberList(member: IOrganizationMember, query: IPagination) {
        const result = await this.organizationMemberModel.getMemberList(member, query)
        return result
    }

    async inviteMember(uid: string, member: IOrganizationMember) {
        if (!member.email || !member.organizationId) {
            throw '邀約資料有誤'
        }
        // 找既有客戶資料
        const existedMember = await this.userModel.getPublicInfo('email', member.email)
        member.name = existedMember.name ?? '新用戶'
        member.allowMethods = ['GET']

        // 發出信件邀請
        const organization = await this.organizaitonModel.getOrganizationById(member.organizationId) as IOrganization
        member.organizationName = organization.name
        const newMember = await this.organizationMemberModel.addMember(uid, member)
        const subject = `邀請加入${organization.name}`
        const html = this.emailAdapter.getInvitation({
            subject,
            recipientName: existedMember.name ?? '用戶',
            organization,
        })
        this.emailAdapter.send({
            subject,
            recipientEmail: newMember.email,
            recipientName: existedMember.name ?? '新用戶',
            html
        })
        return newMember
    }
}