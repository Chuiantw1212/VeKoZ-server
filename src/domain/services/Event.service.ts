import type { IEventTemplate, ITemplateDesign, } from '../../entities/eventTemplate';
import type { IEvent, } from '../../entities/event';
import EventModel from '../Event.model'
import EventActorModel from '../EventActor.model'
import EventSchemaModel from '../EventSchema.model';
import EventDesignModel from '../EventDesign.model';
import { IOrganization } from '../../entities/organization';

interface Idependency {
    eventModel: EventModel;
    eventDesignModel: EventDesignModel;
    eventActorModel: EventActorModel;
    eventSchemaModel: EventSchemaModel;
}

export default class EventService {
    protected eventModel: EventModel = null as any
    protected eventDesignModel: EventDesignModel = null as any
    protected eventActorModel: EventActorModel = null as any
    protected eventSchemaModel: EventSchemaModel = null as any

    constructor(dependency: Idependency) {
        const {
            eventModel,
            eventDesignModel,
            eventActorModel,
            eventSchemaModel,
        } = dependency
        this.eventModel = eventModel
        this.eventDesignModel = eventDesignModel
        this.eventActorModel = eventActorModel
        this.eventSchemaModel = eventSchemaModel
    }

    async patchEventForm(uid: string, templateDesign: ITemplateDesign): Promise<number> {
        if (!templateDesign.id) {
            throw 'id不存在'
        }
        // 更新EventDesigns
        const count = await this.eventDesignModel.patchMutable(uid, templateDesign.id, templateDesign.mutable)
        // 更新EventSEO
        switch (templateDesign.sqlField) {
            case 'description': {
                this.eventSchemaModel.patchRecordField(uid, String(templateDesign.eventId), {
                    description: templateDesign.mutable?.value ?? ''
                })
                break;
            }
            case 'name': {
                this.eventSchemaModel.patchRecordField(uid, String(templateDesign.eventId), {
                    name: templateDesign.mutable?.value ?? ''
                })
                break;
            }
            case 'date': {
                this.eventSchemaModel.patchRecordField(uid, String(templateDesign.eventId), {
                    startDate: templateDesign.mutable?.value[0] ?? '',
                    endDate: templateDesign.mutable?.value[1] ?? ''
                })
                break;
            }
            case 'organization': {
                this.eventSchemaModel.patchRecordField(uid, String(templateDesign.eventId), {
                    organizationId: templateDesign.mutable?.value ?? '',
                })
                break;
            }
            default: {
                return count
            }
        }
        return count
    }

    async patchEventCalendar(uid: string, event: IEvent): Promise<number> {
        if (!event.id) {
            throw 'event.id不存在'
        }
        if (!event.dateDesignId) {
            throw 'event.dateDesignId不存在'
        }
        // collection
        const dateDesignId = event.dateDesignId
        const originEventDesign: ITemplateDesign = await this.eventDesignModel.getEventDesignById(event.dateDesignId)
        const originMutable = originEventDesign.mutable ?? {}
        Object.assign(originMutable, {
            value: [event.startDate, event.endDate]
        })
        const count = await this.eventDesignModel.patchMutable(uid, dateDesignId, originMutable)
        // SQL
        await this.eventSchemaModel.patchRecordField(uid, event.id, {
            startDate: event.startDate,
            endDate: event.endDate
        })
        return count
    }

    async getEvent(id: string): Promise<IEventTemplate | 0> {
        const eventTemplate: IEventTemplate | 0 = await this.eventModel.getEventById(id)
        if (eventTemplate) {
            const designIds = eventTemplate.designIds || []
            // 取得details並回傳
            const designPromises = await designIds.map((designId: string) => {
                return this.eventDesignModel.getEventDesignById(designId)
            })
            const eventTemplateDesigns = await Promise.all(designPromises) as ITemplateDesign[]
            eventTemplate.designs = eventTemplateDesigns
            delete eventTemplate.designIds
            return eventTemplate
        }
        return 0
    }

    async deleteEvent(uid: string, id: string): Promise<number> {
        const event: IEventTemplate | 0 = await this.eventModel.getEventById(id)
        if (!event) {
            return 0
        }
        const designIds = event.designIds
        if (!designIds) {
            throw '資料有誤, event.designIds不存在'
        }
        const deleteNoSqlPromise = this.eventModel.deleteByEventId(uid, id)
        const deleteSqlPromise = this.eventSchemaModel.dropRecord(uid, id)
        const detailPromises = designIds?.map(designId => {
            return this.eventDesignModel.deleteDesignById(uid, designId)
        })
        const ones = await Promise.all([deleteNoSqlPromise, deleteSqlPromise, ...detailPromises])
        const isSuccess = ones.every((value: number) => value == 1)
        if (isSuccess) {
            return 1
        }
        throw `刪除途中出錯, ${[id, id, ...designIds]}`
    }

    async getAvailableEventList(query: IEvent): Promise<IEvent[]> {
        const events = await this.eventSchemaModel.getAvailableEventList(query) as IEvent[]
        return events
    }

    /**
     * 新增活動
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async createNewEvent(uid: string, eventTemplate: IEventTemplate): Promise<IEvent> {
        if (!eventTemplate.designs?.length) {
            throw 'designs不存在'
        }
        // 建立sql與noSql的關聯，修改時，用collection資料覆蓋SQL
        const result = await this.createEventSchema(eventTemplate)
        const insertedEvent = await this.eventSchemaModel.createRecord(uid, result.event)
        result.eventTemplate.id = insertedEvent.id
        // 拷貝designs
        const designsTemp = eventTemplate.designs
        delete eventTemplate.designs
        // 儲存事件
        const newEvent = await this.eventModel.createEvent(uid, result.eventTemplate) as IEvent
        // 儲存欄位designs
        const designDocPromises = designsTemp.map((design) => {
            return this.eventDesignModel.createDesign(uid, design)
        })
        const designDocs: ITemplateDesign[] = await Promise.all(designDocPromises) as ITemplateDesign[]
        const designIds = designDocs.map(doc => doc.id ?? '')
        // 更新事件
        await this.eventModel.mergeDesignIds(uid, String(newEvent.id), designIds)
        const dateDesignId = designIds[result.dateTimeRangeIndex]
        await this.eventSchemaModel.patchRecordField(uid, String(insertedEvent.id), {
            dateDesignId
        })
        return newEvent // 回傳完整Event才有機會，未來打開新事件時不用重新get
    }

    private async createEventSchema(eventTemplate: IEventTemplate) {
        if (!eventTemplate.designs) {
            throw 'designs欄位遺失'
        }

        const event: IEvent = {
            name: '',
            startDate: '',
            endDate: '',
            description: '',
            dateDesignId: '', // 這邊需要另外更新
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
        const dateTimeRangeIndex: number = templateDesigns.findIndex((design: ITemplateDesign) => {
            return design.type === 'dateTimeRange'
        })
        const dateTimeRange = templateDesigns[dateTimeRangeIndex]
        if (dateTimeRange) {
            event.startDate = dateTimeRange.mutable?.value[0]
            event.endDate = dateTimeRange.mutable?.value[1]
            // event.dateDesignId = dateTimeRange.id // 這邊需要另外更新
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

        // 所屬組織
        const organizationDesign: ITemplateDesign = templateDesigns.find((design: ITemplateDesign) => {
            return design.type === 'organization'
        }) as ITemplateDesign
        if (organizationDesign) {
            const organizationId = organizationDesign.mutable?.value
            event.organizationId = organizationId
            organizationDesign.sqlField = 'organization'
        }

        return {
            event,
            eventTemplate,
            dateTimeRangeIndex,
        }
    }
}