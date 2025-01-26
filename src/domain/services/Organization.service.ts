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

    storeLogo(id: string, logo: any) {
        this.organizationModel.storeLogo(id, logo)
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
     * 取得列表
     * @returns 
     */
    async getList() {
        const list: IOrganization[] = await this.organizationModel.getList()
        return list
    }
}