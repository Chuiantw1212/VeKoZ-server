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

    async getEvent(eventId: string): Promise<IEventTemplate | number> {
        const event = await this.eventModel.queryByEventId(eventId)
        return event
    }

    async deleteEvent(uid: string, eventId: string): Promise<number> {
        const deleteNoSqlCount = await this.eventModel.deleteByEventId(uid, eventId)
        if (deleteNoSqlCount) {
            const deleteSqlCount = await this.eventSchemaModel.dropRecord(uid, eventId)
            if (deleteSqlCount) {
                return deleteSqlCount
            }
        }
        return 0
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
        // 建立sql與noSql的關聯，修改時，用noSQL資料覆蓋SQL
        const result = await this.createEventSchema(eventTemplate)
        // 存進SQL方便搜尋，並取得uuid
        const insertedEvent = await this.eventSchemaModel.createRecord(uid, result.event)
        result.eventTemplate.eventId = insertedEvent.id
        // 再用id儲存nosql
        const newEvent = await this.eventModel.createEvent(uid, result.eventTemplate) as IEvent
        return newEvent
    }

    async createEventSchema(eventTemplate: IEventTemplate) {
        if (!eventTemplate.designs) {
            throw 'designs欄位遺失'
        }

        const event: IEvent = {
            name: '',
            startDate: '',
            endDate: '',
            description: '',
        }

        const templateDesigns: ITemplateDesign[] = eventTemplate.designs as ITemplateDesign[]

        // 標題
        const header1: ITemplateDesign = templateDesigns.find((design: ITemplateDesign) => {
            return design.type === 'header1'
        }) as ITemplateDesign
        if (header1) {
            event.name = header1.mutable?.value
            header1.sqlField = 'name'
        }

        // 時間
        const dateTimeRange: ITemplateDesign = templateDesigns.find((design: ITemplateDesign) => {
            return design.type === 'dateTimeRange'
        }) as ITemplateDesign
        if (dateTimeRange) {
            event.startDate = dateTimeRange.mutable?.value[0]
            event.endDate = dateTimeRange.mutable?.value[1]
            dateTimeRange.sqlField = 'date'
        }

        // 描述
        const description: ITemplateDesign = templateDesigns.find((design: ITemplateDesign) => {
            return design.type === 'textarea'
        }) as ITemplateDesign
        if (description) {
            event.description = description.mutable?.value
            description.sqlField = 'description'
        }

        return {
            event,
            eventTemplate,
        }
    }
}