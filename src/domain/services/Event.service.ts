import EventModel from '../Event.model'
import EventActorModel from '../EventActor.model'
import EventTemplateModel from '../EventTemplate.model'

interface Idependency {
    eventModel: EventModel;
    eventActorModel: EventActorModel;
    eventTemplateModel: EventTemplateModel;
}
export default class EventService {
    protected eventModel: EventModel = null as any
    protected eventActorModel: EventActorModel = null as any
    protected eventTemplateModel: EventTemplateModel = null as any

    constructor(dependency: Idependency) {
        const {
            eventModel,
            eventActorModel,
            eventTemplateModel,
        } = dependency
        this.eventModel = eventModel
        this.eventActorModel = eventActorModel
        this.eventTemplateModel = eventTemplateModel
    }

    putTemplate(template: string) {

    }
}