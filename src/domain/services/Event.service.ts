import type { IEventTemplate, ITemplateDesign, } from '../../entities/eventTemplate';
import type { IEvent, } from '../../entities/event';
import type { IEventMember } from '../../entities/eventMember';
import EventModel from '../Event.model'
import EventActorModel from '../EventActor.model'
import EventTemplateModel from '../EventTemplate.model'
import EventSchemaModel from '../EventSchema.model';
import EventTemplateDesignModel from '../EventTemplateDesign.model';

interface Idependency {
    eventModel: EventModel;
    eventActorModel: EventActorModel;
    eventTemplateModel: EventTemplateModel;
    eventSchemaModel: EventSchemaModel;
    eventTemplateDesignModel: EventTemplateDesignModel
}

export default class EventService {
    protected eventModel: EventModel = null as any
    protected eventActorModel: EventActorModel = null as any
    protected eventTemplateModel: EventTemplateModel = null as any
    protected eventTemplateDesignModel: EventTemplateDesignModel = null as any
    protected eventSchemaModel: EventSchemaModel = null as any

    constructor(dependency: Idependency) {
        const {
            eventModel,
            eventActorModel,
            eventTemplateModel,
            eventSchemaModel,
            eventTemplateDesignModel,
        } = dependency
        this.eventModel = eventModel
        this.eventActorModel = eventActorModel
        this.eventTemplateModel = eventTemplateModel
        this.eventSchemaModel = eventSchemaModel
        this.eventTemplateDesignModel = eventTemplateDesignModel
    }

    async getEvent(eventId: string): Promise<IEventTemplate> {
        const result = await this.eventModel.queryByEventId(eventId) as IEventTemplate[]
        return result
    }

    async deleteEvent(uid: string, eventId: string): Promise<number> {
        const noSqlPromise = await this.eventModel.deleteByEventId(uid, eventId)
        await this.eventSchemaModel.dropRecord(uid, eventId)
        return noSqlPromise
    }

    async getEventRecords(query: IEvent): Promise<IEvent[]> {
        return await this.eventSchemaModel.selectRecords(query) as IEvent[]
    }

    async createNewEvent(uid: string, eventTemplate: IEventTemplate): Promise<IEvent> {
        // 先儲存sql取得id
        const event = await this.setEventSchema(uid, eventTemplate)
        eventTemplate.eventId = event.id
        // 再用id儲存nosql
        this.eventModel.createNewDoc(uid, eventTemplate)
        return event
    }

    private async setEventSchema(uid: string, eventTemplate: IEventTemplate) {
        if (!eventTemplate.designs) {
            throw 'designs欄位遺失'
        }

        const event: IEvent = {
            name: '',
            startDate: '',
            endDate: '',
            description: '',
        }
        const eventMembers: IEventMember[] = []

        // 標題
        const header1: ITemplateDesign = eventTemplate.designs.find((design: ITemplateDesign) => {
            return design.type === 'header1'
        }) as ITemplateDesign
        if (header1) {
            event.name = header1.mutable.value
        }

        // 時間
        const dateTimeRange: ITemplateDesign = eventTemplate.designs.find((design: ITemplateDesign) => {
            return design.type === 'dateTimeRange'
        }) as ITemplateDesign
        if (dateTimeRange) {
            event.startDate = dateTimeRange.mutable.value[0]
            event.endDate = dateTimeRange.mutable.value[1]
        }

        // 描述
        const description: ITemplateDesign = eventTemplate.designs.find((design: ITemplateDesign) => {
            return design.type === 'textarea'
        }) as ITemplateDesign
        if (description) {
            event.description = description.mutable.value
        }

        // 這邊取得record uuid
        const insertedEvent: IEvent = await this.eventSchemaModel.insertRecord(uid, event)
        return insertedEvent
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
    async getTemplate(uid: string): Promise<IEventTemplate> {
        return await this.eventTemplateModel.getUniqueDoc(uid)
    }
}