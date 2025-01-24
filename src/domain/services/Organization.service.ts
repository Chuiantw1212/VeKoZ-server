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

    newItem(organization: IOrganization) {
        this.organizationModel.createNewDoc(uid, logo)
    }
}