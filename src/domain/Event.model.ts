import FirestoreAdapter from '../adapters/Firestore.adapter'
import type { IModelPorts } from '../ports/out.model'
import type { IEvent } from '../entities/event'
import { Jieba, TfIdf } from '@node-rs/jieba'
import { dict, idf } from '@node-rs/jieba/dict'
import { ICrudOptions } from '../ports/out.crud'

const jieba = Jieba.withDict(dict)
const tfIdf = TfIdf.withDict(idf)

export default class EventModel extends FirestoreAdapter {
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
        if (event.startDate) {
            event.startDate = super.formatTimestamp(event.startDate)
        }
        if (event.endDate) {
            event.endDate = super.formatTimestamp(event.endDate)
        }
        const newEventDoc: IEvent = await super.createItem(uid, event)
        return newEventDoc
    }

    /**
     * R
     * @param condition 
     * @returns 
     */
    async getAvailableEventList(condition: IEvent): Promise<IEvent[]> {
        const wheres = []
        if (condition.startDate) {
            wheres.push(['startDate', '>=', new Date(condition.startDate)])
        }
        if (condition.endDate) {
            wheres.push(['endDate', '<=', new Date(condition.endDate)])
        }
        if (condition.keywords) {
            const result = tfIdf.extractKeywords(
                jieba,
                condition.keywords,
                30,
            )
            const keywords = result.map(item => {
                return item.keyword
            })
            wheres.push(['keywords', 'array-contains-any', keywords])
        }

        const docDatas = await super.getItemsByQuery(wheres)
        docDatas.forEach(docData => {
            if (docData.startDate) {
                docData.startDate = super.formatDate(docData.startDate)
            }
            if (docData.endDate) {
                docData.endDate = super.formatDate(docData.endDate)
            }
        })
        return docDatas as IEvent[]
    }

    /**
     * 查詢
     * @param id 
     * @returns 
     */
    async getEventById(id: string): Promise<IEvent | 0> {
        const events = await super.getItemsByQuery([['id', '==', id]]) as IEvent[]
        if (events) {
            const event = events[0]
            if (event.startDate) {
                event.startDate = super.formatDate(event.startDate)
            }
            if (event.endDate) {
                event.endDate = super.formatDate(event.endDate)
            }
            return event
        }
        return 0
    }

    /**
     * 修改
     * @param uid 
     * @param id 
     * @param data 
     * @returns 
     */
    async mergeEventById(uid: string, id: string, event: IEvent): Promise<number> {
        if (event.startDate) {
            event.startDate = super.formatTimestamp(event.startDate)
        }
        if (event.endDate) {
            event.endDate = super.formatTimestamp(event.endDate)
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

    /**
     * 重新處理關鍵字
     * @param uid 
     * @param id 
     */
    async setKeywordsById(uid: string, id: string) {
        const event = await super.getItemById(id) as IEvent
        const description = event.description
        const name = event.name
        const fullText = `${name},${description}`
        const result = tfIdf.extractKeywords(
            jieba,
            fullText,
            30,
        )
        const keywords = result.map(item => {
            return item.keyword
        })
        const options: ICrudOptions = {
            count: {
                absolute: 1
            }
        }
        await super.setItemById(uid, id, {
            keywords,
        }, options)
    }
}