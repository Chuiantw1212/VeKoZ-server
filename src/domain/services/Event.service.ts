import type { IEventTemplate, ITemplateDesign, } from '../../entities/eventTemplate';
import type { IEvent, IEventQuery, } from '../../entities/event';
import EventModel from '../Event.model'
import EventActorModel from '../EventActor.model'
import EventDesignModel from '../EventDesign.model';
import OrganizationModel from '../Organization.model';
import NlpAdapter from '../../adapters/nlp.out';
import OfferModel from '../OfferModel';

interface Idependency {
    eventModel: EventModel;
    eventDesignModel: EventDesignModel;
    eventActorModel: EventActorModel;
    organizationModel: OrganizationModel
    nlpAdapter: NlpAdapter,
    offerModel: OfferModel
}

export default class EventService {
    private eventModel: EventModel
    private eventDesignModel: EventDesignModel
    private organizationModel: OrganizationModel
    private nlpAdapter: NlpAdapter
    private offerModel: OfferModel
    private seoFields: string[] = ['name', 'description', 'organizer', 'performers']

    constructor(dependency: Idependency) {
        const {
            eventModel,
            eventDesignModel,
            organizationModel,
            nlpAdapter,
            offerModel,
        } = dependency
        this.eventModel = eventModel
        this.eventDesignModel = eventDesignModel
        this.organizationModel = organizationModel
        this.nlpAdapter = nlpAdapter
        this.offerModel = offerModel
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
        // 更新EventMaster
        const eventPatchePromises = designsWithFormField.map((design: ITemplateDesign) => {
            const eventPatch = this.extractFormField(design, uid)
            return eventPatch
        })
        const eventPatches = await Promise.all(eventPatchePromises)
        eventPatches.forEach(eventPatch => { // 整合成完整IEvent
            if (eventPatch) {
                Object.assign(event, eventPatch)
            }
        })
        // 創建事件Master與關鍵字
        const newEvent: IEvent = await this.eventModel.createEvent(uid, event)
        eventTemplate.id = newEvent.id
        this.updateEventKeywordsById(uid, String(newEvent.id))
        // 創建designs
        const offerCategoryIds: string[] = []
        const designDocPromises = eventTemplate.designs.map(async (design) => {
            delete design.id // 重要，不然會污染到模板資料
            // 特殊處理Offer
            if (design.type === 'offers' && design.mutable && design.mutable.offers) {
                const categoryId = crypto.randomUUID()
                const categoryName = design.mutable.label ?? ''
                const newOffers = structuredClone(design.mutable.offers)
                newOffers.forEach(offer => {
                    offer.inventoryValue = offer.inventoryMaxValue ?? 0
                    offer.eventId = event.id ?? ''
                    offer.eventName = event.name ?? ''
                    offer.categoryId = categoryId // composite key
                    offer.categoryName = categoryName
                    offer.sellerId = event.organizerId ?? ''
                    offer.sellerName = event.organizerName ?? ''
                    offer.offererId = event.organizerId ?? ''
                    offer.offererName = event.organizerName ?? ''
                    offer.validFrom = event.startDate
                    offer.validThrough = event.endDate
                    offer.availableAtOrFrom = 'VeKoZ' // composite key
                    return offer
                })
                const createdOffers = await this.offerModel.createOffers(uid, newOffers)
                design.mutable.categoryId = categoryId
                design.mutable.offers.forEach((offer, index) => { // 這步驟沒意義，因為更新不回去
                    offer.id = createdOffers[index].id
                })
                offerCategoryIds.push(categoryId)
            }
            return this.eventDesignModel.createDesign(uid, design)
        })
        const designDocs: ITemplateDesign[] = await Promise.all(designDocPromises) as ITemplateDesign[]
        newEvent.designs = designDocs
        const designIds = designDocs.map(doc => doc.id ?? '')
        // 回頭更新事件Master
        const dateDesign = designDocs.find(design => {
            return design.formField === 'dates' // 唯一一個
        })
        this.eventModel.mergeEventById(uid, String(newEvent.id), {
            dateDesignId: dateDesign?.id,
            designIds,
            offerCategoryIds,
        })
        return newEvent // 回傳完整Event才有機會，未來打開新事件時不用重新get
    }

    async patchEventForm(uid: string, eventDesign: ITemplateDesign): Promise<number> {
        if (!eventDesign.id || !eventDesign.eventId || !eventDesign.mutable) {
            throw 'id或是eventId不存在'
        }
        // 更新EventDesigns
        const count = await this.eventDesignModel.patchEventDesignById(uid, eventDesign.id, eventDesign)
        if (!eventDesign.formField) {
            return count
        }
        // 更新EventMaster
        const eventPatch = await this.extractFormField(eventDesign, uid)
        // 例外處理offers
        if (eventDesign.formField === 'offers') {
            eventDesign.mutable.offers?.forEach(offer => {
                if (offer.id) {
                    // 更新既有offer
                    this.offerModel.setOfferById(uid, offer.id, offer)
                } else {
                    // 新增offer
                }
                // 刪除不存在的

            })
        }
        // 更新event
        if (eventPatch) {
            await this.eventModel.mergeEventById(uid, eventDesign.eventId, eventPatch)
            // 已存的事件更新關鍵字列表
            if (this.seoFields.includes(eventDesign.formField)) {
                this.updateEventKeywordsById(uid, eventDesign.eventId)
            }
        }
        return count
    }

    private async extractFormField(eventDesign: ITemplateDesign, uid: string) {
        if (!eventDesign.mutable) {
            return
        }
        const eventPatch: IEvent = {}
        switch (eventDesign.formField) {
            case 'location': {
                eventPatch.locationId = eventDesign.mutable.placeId
                eventPatch.locationAddressRegion = eventDesign.mutable.placeAddressRegion
                break;
            }
            case 'banner': {
                eventPatch.banner = eventDesign.mutable.value
                break;
            }
            case 'description': {
                eventPatch.description = eventDesign.mutable.value
                break;
            }
            case 'name': {
                eventPatch.name = eventDesign.mutable.value
                break;
            }
            case 'dates': {
                const startDate = eventDesign.mutable.value[0]
                const endDate = eventDesign.mutable.value[1]
                eventPatch.startDate = startDate
                eventPatch.endDate = endDate
                const startHour = new Date(startDate).getHours()
                if (6 <= startHour && startHour < 12) {
                    eventPatch.startHour = 'morning'
                }
                if (12 <= startHour && startHour < 18) {
                    eventPatch.startHour = 'afternoon'
                }
                if (18 <= startHour && startHour < 24) {
                    eventPatch.startHour = 'evening'
                }
                break;
            }
            case 'organizer': {
                if (eventDesign.mutable?.organizationId) {
                    const organizerLogo = await this.organizationModel.getLogoUrl(eventDesign.mutable.organizationId)
                    eventPatch.organizerId = eventDesign.mutable.organizationId
                    eventPatch.organizerName = eventDesign.mutable.organizationName
                    eventPatch.organizerLogo = organizerLogo
                }
                break;
            }
            // case 'offers': {
            //     if (eventDesign.mutable.offers) {
            //         eventPatch.offerIds = await this.offerModel.setOffers(uid, eventDesign.mutable.offers)
            //     }
            //     break;
            // }
            default: {
                return {}
            }
        }
        return eventPatch
    }

    /**
     * 更新event.keywords
     * @param uid 
     * @param eventId 
     */
    private async updateEventKeywordsById(uid: string, eventId: string,) {
        const event = await this.eventModel.getEventById(eventId)
        if (!event) return

        // 優先欄位
        const organizationName = String(event.organizerName)

        // 需要篩選欄位
        const description = event.description
        const name = event.name
        const fullText = `${name}。${description}`
        const extractedWords = this.nlpAdapter.extractKeywords(fullText)
        const newKeywords = [organizationName, ...extractedWords].slice(0, 30)

        // 回存
        this.eventModel.mergeEventById(uid, eventId, {
            keywords: newKeywords
        })
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
        const { dateDesignId, startDate, endDate, isPublic, offerCategoryIds } = updateEventReq
        if (dateDesignId && startDate && endDate) {
            const originEventDesign: ITemplateDesign = await this.eventDesignModel.getEventDesignById(dateDesignId)
            if (originEventDesign.mutable) {
                originEventDesign.mutable.value = [startDate, endDate]
            }
            await this.eventDesignModel.patchEventDesignById(uid, dateDesignId, originEventDesign)
        }
        if (offerCategoryIds && startDate && endDate) {
            await this.offerModel.updateOffersValidTime(uid, offerCategoryIds, {
                validFrom: startDate,
                validThrough: endDate
            })
        }
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

    async getEvent(id: string, uid: string,): Promise<IEventTemplate | 0> {
        const eventTemplate: IEventTemplate | 0 = await this.eventModel.getEventById(id)
        if (eventTemplate) {
            const designIds = eventTemplate.designIds || []
            // 取得details並回傳
            const designPromises = await designIds.map((designId: string) => {
                return this.eventDesignModel.getEventDesignById(designId)
            })
            const eventTemplateDesigns = await Promise.all(designPromises) as ITemplateDesign[]
            const isAllDetailMissing = eventTemplateDesigns.every(value => !value)
            if (isAllDetailMissing) {
                if (uid) {
                    console.error('event.designs皆為0', id)
                    this.eventModel.deleteByEventId(uid, id)
                }
                return 0
            } else {
                eventTemplate.designs = eventTemplateDesigns
                delete eventTemplate.designIds
                return eventTemplate
            }
        }
        return 0
    }

    async deleteEvent(uid: string, id: string): Promise<number> {
        const event: IEvent | 0 = await this.eventModel.getEventById(id)
        if (!event) {
            return 0
        }
        // 先刪除票券
        const offerDeletedCount = await this.offerModel.deleteOffers(uid, String(event.id))
        if (!offerDeletedCount) {
            console.error('票券未成功刪除')
        }
        // 再刪去其他資料
        const designIds = event.designIds ?? []
        if (!designIds.length) {
            console.error('資料有誤, event.designIds不存在', id)
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
        /**
         * 處理
         */
        if (query.keywords) {
            const keywords = this.nlpAdapter.cutForSearch(query.keywords as string)
            query.keywords = keywords
        }
        const events = await this.eventModel.queryEventList(query) as IEvent[]
        return events
    }
}