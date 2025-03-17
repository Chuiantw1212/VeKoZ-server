import VekozModel from '../adapters/VekozModel.out'
import type { IModelPorts } from '../ports/out.model'
import type { IEvent, IEventQuery } from '../entities/event'
import { ICrudOptions } from '../ports/out.crud'

export default class EventModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    /**
     * 新增
     * @param uid 
     * @param event 
     * @returns 
     */
    async createEvent(uid: string, event: IEvent): Promise<IEvent> {
        delete event.designs // 防呆

        if (typeof event.startDate === 'string') {
            event.startDate = super.formatDate(event.startDate)
        }
        if (typeof event.endDate === 'string') {
            event.endDate = super.formatDate(event.endDate)
        }
        const newEventDoc: IEvent = await super.createItem(uid, event) as IEvent
        // event.startDate = super.formatDate(event.startDate)
        // event.endDate = super.formatDate(event.endDate)
        return newEventDoc
    }

    /**
     * R
     * @param condition 
     * @returns 
     */
    async queryEventList(query: IEventQuery): Promise<IEvent[]> {
        const wheres = []
        if (query.organizerId) {
            wheres.push(['organizerId', '==', query.organizerId])
        }
        if (query.startDate && typeof query.startDate === 'string') {
            const startDate = new Date(query.startDate)
            if (!isNaN(startDate.getTime())) {
                wheres.push(['startDate', '>=', startDate])
            }
        }
        if (query.endDate && typeof query.endDate === 'string') {
            const endDate = new Date(query.endDate)
            if (!isNaN(endDate.getTime())) {
                wheres.push(['endDate', '<=', endDate])
            }
        }
        if (query.startHour) {
            wheres.push(['startHour', '==', query.startHour])
        }
        if (query.keywords?.length) {
            wheres.push(['keywords', 'array-contains-any', query.keywords])
        }
        if (String(query.isPublic) === 'true') {
            wheres.push(['isPublic', '==', true])
        }
        if (String(query.isPublic) === 'false') {
            wheres.push(['isPublic', '==', false])
        }
        if (query.performerIds) {
            if (!Array.isArray(query.performerIds)) {
                wheres.push(['performerIds', 'array-contains-any', [query.performerIds]])
            } else {
                wheres.push(['performerIds', 'array-contains-any', query.performerIds])
            }
        }
        const options: ICrudOptions = {
            orderBy: ['startDate', 'asc'],
        }
        if (query.limit) {
            options.limit = query.limit
        }
        // 必須放在最後的區域選擇
        let hasOnSite = query.locationAddressRegion
        if (query.locationAddressRegion) {
            wheres.push(['locationAddressRegion', '==', query.locationAddressRegion])
        }
        const firstEventList = await super.getItemsByWheres(wheres, options)
        firstEventList.forEach(docData => {
            if (docData.startDate) {
                docData.startDate = super.formatDate(docData.startDate)
            }
            if (docData.endDate) {
                docData.endDate = super.formatDate(docData.endDate)
            }
        })

        /**
         * 在選定城市情況下，補外縣市的線上活動
         */
        let onlineEvents: IEvent[] = []
        if (String(query.hasVirtualLocation) === 'true') {
            if (hasOnSite) {
                wheres.pop() // 丟掉城市篩選
                wheres.push(['locationAddressRegion', '!=', query.locationAddressRegion])
            }
            wheres.push(['hasVirtualLocation', '==', true])
            onlineEvents = await super.getItemsByWheres(wheres, options)
            onlineEvents.forEach(docData => {
                if (docData.startDate) {
                    docData.startDate = super.formatDate(docData.startDate)
                }
                if (docData.endDate && typeof docData.endDate !== 'string') {
                    docData.endDate = super.formatDate(docData.endDate)
                }
            })
        }

        const allEvents = [...firstEventList, ...onlineEvents].sort((first, second) => {
            return second.startDate - first.startDate
        })

        // 節省流量，只給出必要的欄位
        const requiredFiels = [
            'id', 'banner', 'name', 'startDate', 'endDate', 'organizerName',
            'organizerLogo', 'offerCategoryIds', 'dateDesignId',
            'locationAddressRegion', 'hasVirtualLocation', 'isPublic', 'organizerId']
        const minimumEvents = allEvents.map((event: IEvent) => {
            const miniEvent: IEvent = {}
            requiredFiels.forEach(field => {
                miniEvent[field] = event[field]
            })
            return miniEvent
        })
        return minimumEvents as IEvent[]
    }

    /**
     * 查詢
     * @param id 
     * @returns 
     */
    async getEventById(id: string): Promise<IEvent | 0> {
        const events = await super.getItemsByWheres([['id', '==', id]]) as IEvent[]
        if (!events) {
            return 0
        }

        const event = events[0]
        delete event.keywords // 前端不需要知道的資料
        if (event.startDate) {
            event.startDate = super.formatDate(event.startDate)
        }
        if (event.endDate) {
            event.endDate = super.formatDate(event.endDate)
        }
        return event
    }

    /**
     * 修改
     * @param uid 
     * @param id 
     * @param data 
     * @returns 
     */
    async mergeEventById(uid: string, id: string, event: IEvent): Promise<number> {
        delete event.designs // 防呆
        if (typeof event.startDate === 'string') {
            event.startDate = super.formatDate(event.startDate)
        }
        if (typeof event.endDate === 'string') {
            event.endDate = super.formatDate(event.endDate)
        }
        const dataAccessOptions = {
            count: {
                absolute: 1
            },
            merge: true,
        }
        const count = await super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], event, dataAccessOptions)
        return count
    }

    /**
     * 刪除
     * @param uid 
     * @param id 
     * @returns 
     */
    async deleteByEventId(uid: string, id: string): Promise<number> {
        const count = await super.deleteItemById(uid, id)
        return count
    }
}