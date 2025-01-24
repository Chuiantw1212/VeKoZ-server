import OrganizationModel from '../Organization.model'

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
}