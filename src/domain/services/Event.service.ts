import type { IEventTemplate, ITemplateDesign, } from '../../entities/eventTemplate';
import type { IEvent, } from '../../entities/event';
import type { IEventMember } from '../../entities/eventMember';
import EventModel from '../Event.model'
import EventActorModel from '../EventActor.model'
import EventSchemaModel from '../EventSchema.model';

interface Idependency {
    eventModel: EventModel;
    eventActorModel: EventActorModel;
    eventSchemaModel: EventSchemaModel;
}

export default class EventService {
    protected eventModel: EventModel = null as any
    protected eventActorModel: EventActorModel = null as any
    protected eventSchemaModel: EventSchemaModel = null as any

    constructor(dependency: Idependency) {
        const {
            eventModel,
            eventActorModel,
            eventSchemaModel,
        } = dependency
        this.eventModel = eventModel
        this.eventActorModel = eventActorModel
        this.eventSchemaModel = eventSchemaModel
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

    async getAvailableEventList(query: IEvent): Promise<IEvent[]> {
        return await this.eventSchemaModel.getAvailableEventList(query) as IEvent[]
    }

    /**
     * 新增活動
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async createNewEvent(uid: string, eventTemplate: IEventTemplate): Promise<IEvent> {
        // 先儲存sql取得id
        const event = await this.setEventSchema(uid, eventTemplate)
        eventTemplate.eventId = event.id
        // 再用id儲存nosql
        const newEvent = await this.eventModel.createEvent(uid, eventTemplate) as IEvent
        return newEvent
    }

    private async setEventSchema(uid: string, eventTemplate: IEventTemplate) {
        if (!eventTemplate.designs) {
            throw 'designs欄位遺失'
        }
        // return
        const event: IEvent = {
            name: '',
            startDate: '',
            endDate: '',
            description: '',
        }
        const eventMembers: IEventMember[] = []

        const templateDesigns: ITemplateDesign[] = eventTemplate.designs as ITemplateDesign[]

        // 標題
        const header1: ITemplateDesign = templateDesigns.find((design: ITemplateDesign) => {
            return design.type === 'header1'
        }) as ITemplateDesign
        if (header1) {
            event.name = header1.mutable?.value
        }

        // 時間
        const dateTimeRange: ITemplateDesign = templateDesigns.find((design: ITemplateDesign) => {
            return design.type === 'dateTimeRange'
        }) as ITemplateDesign
        if (dateTimeRange) {
            event.startDate = dateTimeRange.mutable?.value[0]
            event.endDate = dateTimeRange.mutable?.value[1]
        }

        // 描述
        const description: ITemplateDesign = templateDesigns.find((design: ITemplateDesign) => {
            return design.type === 'textarea'
        }) as ITemplateDesign
        if (description) {
            event.description = description.mutable?.value
        }

        // 這邊取得record uuid
        const insertedEvent = await this.eventSchemaModel.createRecord(uid, event)
        return insertedEvent
    }
}