import type { IEventTemplate, ITemplateDesign, } from '../../entities/eventTemplate';
import type { IEvent, } from '../../entities/event';
import EventModel from '../Event.model'
import EventActorModel from '../EventActor.model'
import EventDesignModel from '../EventDesign.model';

interface Idependency {
    eventModel: EventModel;
    eventDesignModel: EventDesignModel;
    eventActorModel: EventActorModel;
}

export default class EventService {
    protected eventModel: EventModel = null as any
    protected eventDesignModel: EventDesignModel = null as any
    protected eventActorModel: EventActorModel = null as any

    constructor(dependency: Idependency) {
        const {
            eventModel,
            eventDesignModel,
            eventActorModel,
        } = dependency
        this.eventModel = eventModel
        this.eventDesignModel = eventDesignModel
        this.eventActorModel = eventActorModel
    }

    async patchEventForm(uid: string, eventDesign: ITemplateDesign): Promise<number> {
        if (!eventDesign.id) {
            throw 'id不存在'
        }
        // 更新EventDesigns
        const count = await this.eventDesignModel.patchEventDesignById(uid, eventDesign.id, eventDesign)
        // 更新EventSEO
        console.log({
            eventDesign
        })
        switch (eventDesign.formField) {
            case 'description': {
                await this.eventModel.mergeEventById(uid, String(eventDesign.eventId), {
                    description: eventDesign.mutable?.value ?? ''
                })
                this.eventModel.setKeywordsById(uid, String(eventDesign.eventId))
                break;
            }
            case 'name': {
                await this.eventModel.mergeEventById(uid, String(eventDesign.eventId), {
                    name: eventDesign.mutable?.value ?? ''
                })
                this.eventModel.setKeywordsById(uid, String(eventDesign.eventId))
                break;
            }
            case 'date': {
                await this.eventModel.mergeEventById(uid, String(eventDesign.eventId), {
                    startDate: eventDesign.mutable?.value[0] ?? '',
                    endDate: eventDesign.mutable?.value[1] ?? ''
                })
                break;
            }
            case 'organization': {
                await this.eventModel.mergeEventById(uid, String(eventDesign.eventId), {
                    organizationId: eventDesign.mutable?.value ?? '',
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
        if (originEventDesign.mutable) {
            originEventDesign.mutable.value = [event.startDate, event.endDate]
        }
        const count = await this.eventDesignModel.patchEventDesignById(uid, dateDesignId, originEventDesign)
        // SQL
        await this.eventModel.mergeEventById(uid, event.id, {
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
        const designIds = event.designIds ?? []
        if (!designIds.length) {
            console.trace('資料有誤, event.designIds不存在', id)
            // return 0
        }
        const masterPromise = this.eventModel.deleteByEventId(uid, id)
        const detailPromises = designIds?.map(designId => {
            return this.eventDesignModel.deleteDesignById(uid, designId)
        })
        const ones = await Promise.all([masterPromise, ...detailPromises])
        const isSuccess = ones.every((value: number) => value == 1)
        if (isSuccess) {
            return 1
        } else {
            // throw `刪除途中出錯, ${[id, id, ...designIds]}`
            return 500
        }
    }

    async queryEventList(query: IEvent): Promise<IEvent[]> {
        const events = await this.eventModel.queryEventList(query) as IEvent[]
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
        const event: IEvent = {
            name: '',
            startDate: '',
            endDate: '',
            description: '',
            dateDesignId: '', // 這邊需要另外更新
        }
        const templateDesigns: ITemplateDesign[] = eventTemplate.designs as ITemplateDesign[]
        let dateDesignIndex: number = -1
        templateDesigns.forEach((design, index) => {
            if (design.formField) {
                if (design.formField === 'date') {
                    const startDate = design.mutable?.value[0]
                    const endDate = design.mutable?.value[1]
                    event.startDate = startDate
                    event.endDate = endDate
                    dateDesignIndex = index
                } else {
                    event[design.formField] = design.mutable?.value
                }
            }
        })
        // 儲存事件Master
        const newEvent = await this.eventModel.createEvent(uid, event)
        eventTemplate.id = newEvent.id
        // 拷貝designs details
        const designsTemp = eventTemplate.designs
        delete eventTemplate.designs
        // 儲存欄位designs details
        const designDocPromises = designsTemp.map((design) => {
            return this.eventDesignModel.createDesign(uid, design)
        })
        const designDocs: ITemplateDesign[] = await Promise.all(designDocPromises) as ITemplateDesign[]
        const designIds = designDocs.map(doc => doc.id ?? '')
        // 更新事件Master
        const dateDesignId = designIds[dateDesignIndex]
        await this.eventModel.mergeEventById(uid, String(newEvent.id), {
            dateDesignId,
            designIds,
        })
        return newEvent // 回傳完整Event才有機會，未來打開新事件時不用重新get
    }
}