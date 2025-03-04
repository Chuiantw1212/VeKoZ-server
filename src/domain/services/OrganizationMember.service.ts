import OrganizationMemberModel from '../OrganizationMember.model';
import type { IOrganization, IOrganizationMember } from '../../entities/organization';
import EmailAdapter from '../../adapters/email.out';
import OrganizationModel from '../Organization.model';
import UserModel from '../User.model';

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

    /**
     * 取得成員列表
     * @param uid 使用者uid
     * @param organizationId 企業文件Id
     * @returns 
     */
    async getMemberList(uid: string, organizationId: string): Promise<IOrganizationMember[]> {
        const list: IOrganizationMember[] = await this.organizationMemberModel.getMemberList(uid, organizationId) as IOrganizationMember[]
        return list
    }

    async inviteMember(uid: string, member: IOrganizationMember) {
        // 找既有客戶資料
        const existedMember = await this.userModel.getPublicInfo('email', member.email)
        member.name = existedMember.name ?? '新用戶'

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