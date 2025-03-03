import OrganizationMemberModel from '../OrganizationMember.model';
import type { IOrganization, IOrganizationMember } from '../../entities/organization';
import EmailAdapter from '../../adapters/email.out';
import OrganizationModel from '../Organization.model';
import UserModel from '../User.model';
import { IPagination } from '../../entities/meta';
import { ICrudOptions } from '../../ports/out.crud';

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

    async setMember(uid: string, member: IOrganizationMember,) {
        const count = await this.organizationMemberModel.setMember(uid, member)
        return count
    }

    async deleteMember(uid: string, id: string,) {
        const count = await this.organizationMemberModel.deleteMember(uid, id)
        return count
    }

    async checkMemberAuths(email: string, organizationId: string, method: string) {
        await this.organizationMemberModel.checkMemberAuths(email, organizationId, method)
    }

    /**
     * 取得成員列表
     * @param uid 使用者uid
     * @param organizationId 企業文件Id
     * @returns 
     */
    async getMemberList(uid: string, organizationId: string, query: IPagination) {
        const result = await this.organizationMemberModel.getMemberList(uid, organizationId, query)
        return result
    }

    async inviteMember(uid: string, member: IOrganizationMember) {
        // 找既有客戶資料
        const existedMember = await this.userModel.getPublicInfo('email', member.email)
        member.name = existedMember.name ?? '新用戶'
        member.auths = ['get']

        // 發出信件邀請
        const newMember = await this.organizationMemberModel.addMember(uid, member)
        this.organizaitonModel.getOrganizationById(member.organizationId).then((organization) => {
            organization = organization as IOrganization
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
        })
        return newMember
    }
}