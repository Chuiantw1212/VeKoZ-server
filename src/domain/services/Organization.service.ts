import OrganizationModel from '../Organization.model'
import type { IOrganization } from '../../entities/organization';

interface Idependency {
    organizationModel: OrganizationModel;
}
export default class EventService {
    protected organizationModel: OrganizationModel = null as any

    constructor(dependency: Idependency) {
        const {
            organizationModel,
        } = dependency
        this.organizationModel = organizationModel
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
    async getList() {
        const list: IOrganization[] = await this.organizationModel.getList()
        return list
    }

    /**
     * 刪除組織
     * @param id 
     * @returns 
     */
    async deleteItem(id: string) {
        return await this.organizationModel.deleteItem(id)
    }
}