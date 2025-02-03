import type { IEventTemplate, } from '../../entities/eventTemplate';
import type { IEvent } from '../../entities/event';
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

    async createNewEvent(uid: string, event: IEvent) {
        return await this.eventModel.createNewDoc(uid, event)
    }

    async putTemplate(uid: string, template: IEventTemplate): Promise<string> {
        // 為每個design mutable建立自己的uuid
        template.designs?.forEach((design) => {
            if (!design.id) {
                design.id = crypto.randomUUID()
            }
        })

        if (template.id) {
            return await this.eventTemplateModel.mergeUniqueDoc(uid, template)
        } else {
            return await this.eventTemplateModel.createNewDoc(uid, template)
        }
    }
    async getTemplate(uid: string): Promise<any> {
        return await this.eventTemplateModel.getUniqueDoc(uid)
    }
}