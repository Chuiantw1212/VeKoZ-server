import EventTemplateModel from '../EventTemplate.model'
import EventTemplateDesignModel from '../EventTemplateDesign.model';
import OrganizationMemberModel from '../OrganizationMember.model';

interface Idependency {
    eventTemplateModel: EventTemplateModel;
    eventTemplateDesignModel: EventTemplateDesignModel
    organizationMemberModel: OrganizationMemberModel
}

export default class EventTemplateService {
    protected eventTemplateModel: EventTemplateModel
    protected eventTemplateDesignModel: EventTemplateDesignModel
    protected organizationMemberModel: OrganizationMemberModel

    constructor(dependency: Idependency) {
        const {
            eventTemplateModel,
            eventTemplateDesignModel,
            organizationMemberModel,
        } = dependency
        this.eventTemplateModel = eventTemplateModel
        this.eventTemplateDesignModel = eventTemplateDesignModel
        this.organizationMemberModel = organizationMemberModel
    }
}