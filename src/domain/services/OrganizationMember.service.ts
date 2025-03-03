import OrganizationMemberModel from '../OrganizationMember.model';
import type { IOrganizationMember } from '../../entities/organization';

interface Idependency {
    organizationMemberModel: OrganizationMemberModel
}

export default class OrganizationMemberService {
    protected organizationMemberModel: OrganizationMemberModel

    constructor(dependency: Idependency) {
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

    async inviteMember(member: IOrganizationMember) {
        
    }
}