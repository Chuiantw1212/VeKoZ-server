import type { IEventTemplate, ITemplateDesign, } from '../../entities/eventTemplate';
import type { IEvent, } from '../../entities/event';
import type { IEventMember } from '../../entities/eventMember';
import EventModel from '../Event.model'
import EventActorModel from '../EventActor.model'
import EventTemplateModel from '../EventTemplate.model'
import EventSchemaModel from '../EventSchema.model';

interface Idependency {
    eventModel: EventModel;
    eventActorModel: EventActorModel;
    eventTemplateModel: EventTemplateModel;
    eventSchemaModel: EventSchemaModel;
}

export default class EventService {
    protected eventModel: EventModel = null as any
    protected eventActorModel: EventActorModel = null as any
    protected eventTemplateModel: EventTemplateModel = null as any
    protected eventSchemaModel: EventSchemaModel = null as any

    constructor(dependency: Idependency) {
        const {
            eventModel,
            eventActorModel,
            eventTemplateModel,
            eventSchemaModel,
        } = dependency
        this.eventModel = eventModel
        this.eventActorModel = eventActorModel
        this.eventTemplateModel = eventTemplateModel
        this.eventSchemaModel = eventSchemaModel
    }

    async createNewEvent(uid: string, eventTemplate: IEventTemplate) {
        const event: IEvent = {
            name: '',
            startDate: '',
            endDate: '',
            description: '',
        }
        const eventMembers: IEventMember[] = []

        // 標題
        const header1: ITemplateDesign = eventTemplate.value.designs.find((design: ITemplateDesign) => {
            return design.type === 'header1'
        })
        if (header1) {
            event.name = header1.mutable.value
        }

        // 時間
        const dateTimeRange: ITemplateDesign = eventTemplate.value.designs.find((design: ITemplateDesign) => {
            return design.type === 'dateTimeRange'
        })
        if (dateTimeRange) {
            event.startDate = dateTimeRange.mutable.value[0]
            event.endDate = dateTimeRange.mutable.value[1]
        }

        // 描述
        const description: ITemplateDesign = eventTemplate.value.designs.find((design: ITemplateDesign) => {
            return design.type === 'textarea'
        })
        if (description) {
            event.description = description.mutable.value
        }

        // 這邊取得record uuid
        const insertedEvent: IEvent = await this.eventSchemaModel.insertRecord(uid, event)
        

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