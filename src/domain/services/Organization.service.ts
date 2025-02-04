import OrganizationModel from '../Organization.model'
import OrganizationMemberModel from '../OrganizationMember.model';
import type { IOrganization, IOrganizationMember } from '../../entities/organization';

interface Idependency {
    organizationModel: OrganizationModel;
    organizationMemberModel: OrganizationMemberModel
}

export default class OrganizationService {
    protected organizationModel: OrganizationModel = null as any
    protected organizationMemberModel: OrganizationMemberModel = null as any

    constructor(dependency: Idependency) {
        const {
            organizationModel,
            organizationMemberModel,
        } = dependency
        this.organizationModel = organizationModel
        this.organizationMemberModel = organizationMemberModel
    }

    async storeLogo(id: string, logo: any) {
        return await this.organizationModel.storeLogo(id, logo)
    }

    /**
     * 新增組織
     * @param uid UserUid
     * @param organization 
     */
    newItem(uid: string, organization: IOrganization) {
        return this.organizationModel.createNewDoc(uid, organization)
    }

    /**
     * 取得組織
     */
    async getItem(uid: string) {
        return await this.organizationModel.getUniqueDoc(uid)
    }

    /**
     * 更新組織
     */
    async mergeUniqueDoc(uid: string, organization: IOrganization) {
        return await this.organizationModel.mergeUniqueDoc(uid, organization)
    }

    /**
     * 取得列表
     * @returns 
     */
    async getDocList() {
        const list: IOrganization[] = await this.organizationModel.getDocList()
        return list
    }

    /**
     * 取得成員列表
     * @param uid 使用者uid
     * @param organizationId 企業文件Id
     * @returns 
     */
    async getMemberList(uid: string, organizationId: string) {
        const list = await this.organizationMemberModel.queryDocList(uid, {
            organizationId,
        }) as IOrganizationMember[]
        return list
    }

    /**
     * 刪除組織
     * @param id 
     * @returns 
     */
    async deleteItem(uid: string, id: string) {
        return await this.organizationModel.deleteItem(uid, id)
    }
}