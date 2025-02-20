import type { IEventTemplate, ITemplateDesign, } from '../../entities/eventTemplate';
import type { IEvent, IEventQuery, } from '../../entities/event';
import EventModel from '../Event.model'
import EventActorModel from '../EventActor.model'
import EventDesignModel from '../EventDesign.model';
import OrganizationModel from '../Organization.model';

interface Idependency {
    eventModel: EventModel;
    eventDesignModel: EventDesignModel;
    eventActorModel: EventActorModel;
    organizationModel: OrganizationModel
}

export default class EventService {
    protected eventModel: EventModel = null as any
    protected eventDesignModel: EventDesignModel = null as any
    protected eventActorModel: EventActorModel = null as any
    protected organizationModel: OrganizationModel = null as any

    constructor(dependency: Idependency) {
        const {
            eventModel,
            eventDesignModel,
            eventActorModel,
            organizationModel,
        } = dependency
        this.eventModel = eventModel
        this.eventDesignModel = eventDesignModel
        this.eventActorModel = eventActorModel
        this.organizationModel = organizationModel
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
        const templateDesigns: ITemplateDesign[] = eventTemplate.designs as ITemplateDesign[]
        const designsWithFormField = templateDesigns.filter(design => {
            return design.formField
        })
        const event: IEvent = {
            isPublic: false, // 預設非公開
        }
        let dateDesignIndex: number = -1
        designsWithFormField.forEach(async (design, index) => {
            /**
             * 注意要跟 patchEventForm 那邊的switch case交叉檢查
             */
            switch (design.formField) {
                case 'banner': {
                    event.banner = design.mutable?.value
                    break;
                }
                case 'name': {
                    event.name = design.mutable?.value
                    break;
                }
                case 'description': {
                    event.description = design.mutable?.value
                    break;
                }
                case 'date': {
                    const startDate = design.mutable?.value[0]
                    const endDate = design.mutable?.value[1]
                    event.startDate = startDate
                    event.endDate = endDate
                    const startHour = new Date(startDate).getHours()
                    if (6 <= startHour && startHour < 12) {
                        event.startHour = 'morning'
                    }
                    if (12 <= startHour && startHour < 18) {
                        event.startHour = 'afternoon'
                    }
                    if (18 <= startHour && startHour < 24) {
                        event.startHour = 'evening'
                    }
                    dateDesignIndex = index
                    break;
                }
                case 'organizer': {
                    if (design.mutable?.organizationId) {
                        const organizerLogo = await this.organizationModel.getLogoUrl(design.mutable.organizationId)
                        event.organizerLogo = organizerLogo
                        event.organizerId = design.mutable.organizationId
                        event.organizerName = design.mutable?.organizationName
                    }
                    break;
                }
                case 'performers': {
                    event.performerIds = design.mutable?.memberIds
                    event.organizerName = design.mutable?.organizationName
                    break;
                }
                case 'place': {
                    event.locationAddressRegion = design.mutable?.placeAddressRegion
                    break;
                }
            }
        })
        // 儲存事件Master
        const newEvent = await this.eventModel.createEvent(uid, event)
        eventTemplate.id = newEvent.id
        this.eventModel.setKeywordsById(uid, String(newEvent.id))
        // 拷貝designs details
        const designsTemp = eventTemplate.designs
        delete eventTemplate.designs
        // 儲存欄位designs details
        const designDocPromises = designsTemp.map((design) => {
            delete design.id // 重要，不然會污染到模板資料
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

    async patchEventForm(uid: string, eventDesign: ITemplateDesign): Promise<number> {
        if (!eventDesign.id) {
            throw 'id不存在'
        }
        // 更新EventDesigns
        const count = await this.eventDesignModel.patchEventDesignById(uid, eventDesign.id, eventDesign)
        /**
         * 注意要跟 createForm 那邊的switch case交叉檢查
         */
        switch (eventDesign.formField) {
            case 'banner': {
                await this.eventModel.mergeEventById(uid, String(eventDesign.eventId), {
                    banner: eventDesign.mutable?.value ?? ''
                })
                break;
            }
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
                const startDate = eventDesign.mutable?.value[0] ?? ''
                const endDate = eventDesign.mutable?.value[1] ?? ''
                const eventDatePatch: IEvent = {
                    startDate,
                    endDate
                }
                const startHour = new Date(startDate).getHours()
                if (6 <= startHour && startHour < 12) {
                    eventDatePatch.startHour = 'morning'
                }
                if (12 <= startHour && startHour < 18) {
                    eventDatePatch.startHour = 'afternoon'
                }
                if (18 <= startHour && startHour < 24) {
                    eventDatePatch.startHour = 'evening'
                }
                await this.eventModel.mergeEventById(uid, String(eventDesign.eventId), eventDatePatch)
                break;
            }
            case 'organizer': {
                if (eventDesign.mutable?.organizationId) {
                    const organizerLogo = await this.organizationModel.getLogoUrl(eventDesign.mutable.organizationId)
                    await this.eventModel.mergeEventById(uid, String(eventDesign.eventId), {
                        organizationId: eventDesign.mutable.organizationId,
                        organizerName: eventDesign.mutable?.organizationName,
                        organizerLogo,
                    })
                }
                break;
            }
            default: {
                return count
            }
        }
        return count
    }

    /**
     * 月曆日期拖拽以及開放表單使用
     * @param uid 
     * @param updateEventReq 
     * @returns 
     */
    async patchEventCalendar(uid: string, updateEventReq: IEvent): Promise<number> {
        if (!updateEventReq.id) {
            throw 'event.id不存在'
        }
        const { dateDesignId, startDate, endDate, isPublic } = updateEventReq
        if (dateDesignId && startDate && endDate) {
            const originEventDesign: ITemplateDesign = await this.eventDesignModel.getEventDesignById(dateDesignId)
            if (originEventDesign.mutable) {
                originEventDesign.mutable.value = [startDate, endDate]
            }
            await this.eventDesignModel.patchEventDesignById(uid, dateDesignId, originEventDesign)
        }
        // SQL
        const newEvent: IEvent = {}
        if (isPublic !== null) { // false !== null
            newEvent.isPublic = isPublic
        }
        if (startDate) {
            newEvent.startDate = startDate
        }
        if (endDate) {
            newEvent.endDate = endDate
        }
        const count = await this.eventModel.mergeEventById(uid, updateEventReq.id, newEvent)
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

    async queryEventList(query: IEventQuery): Promise<IEvent[]> {
        const events = await this.eventModel.queryEventList(query) as IEvent[]
        return events
    }
}