import OrganizationMemberModel from '../OrganizationMember.model';
import type { IOrganization, IOrganizationMember } from '../../entities/organization';
import EmailAdapter from '../../adapters/email.out';
import OrganizationModel from '../Organization.model';

interface Idependency {
    emailAdapter: EmailAdapter,
    organizationModel: OrganizationModel
    organizationMemberModel: OrganizationMemberModel
}

export default class OrganizationMemberService {
    protected organizationMemberModel: OrganizationMemberModel
    private organizaitonModel: OrganizationModel
    private emailAdapter: EmailAdapter

    constructor(dependency: Idependency) {
        this.emailAdapter = dependency.emailAdapter
        this.organizaitonModel = dependency.organizationModel
        this.organizationMemberModel = dependency.organizationMemberModel
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
        const newMember = await this.organizationMemberModel.addMember(uid, member)
        this.organizaitonModel.getOrganizationById(member.organizationId).then((organization) => {
            organization = organization as IOrganization
            const subject = `邀請加入${organization.name}`
            const html = this.emailAdapter.getInvitation({
                subject,
                organization,
            })
            this.emailAdapter.send({
                subject,
                recipientEmail: newMember.email,
                html
            })
        })
        return newMember
    }
}