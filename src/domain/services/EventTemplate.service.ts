import type { IEventTemplate, ITemplateDesign, IPostTemplateDesignReq, IDeleteTemplateDesignReq, IPatchTemplateDesignReq } from '../../entities/eventTemplate';
import EventTemplateModel from '../EventTemplate.model'
import EventTemplateDesignModel from '../EventTemplateDesign.model';

interface Idependency {
    eventTemplateModel: EventTemplateModel;
    eventTemplateDesignModel: EventTemplateDesignModel
}

export default class EventTemplateService {
    protected eventTemplateModel: EventTemplateModel = null as any
    protected eventTemplateDesignModel: EventTemplateDesignModel = null as any

    constructor(dependency: Idependency) {
        const {
            eventTemplateModel,
            eventTemplateDesignModel,
        } = dependency
        this.eventTemplateModel = eventTemplateModel
        this.eventTemplateDesignModel = eventTemplateDesignModel
    }

    /**
     * 如果需要取出，使用get取出嗎？
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async addEventTemplate(uid: string, eventTemplate: IEventTemplate): Promise<string> {
        if (!eventTemplate.designs?.length) {
            throw 'designs不存在'
        }
        // 深拷貝designs
        const designsTemp = structuredClone(eventTemplate.designs)
        delete eventTemplate.designs
        // 儲存template
        const newTemplateDoc: IEventTemplate = await this.eventTemplateModel.createUidDoc(uid, eventTemplate, {
            count: {
                max: 1
            }
        })
        // 儲存欄位design
        const designDocPromises = designsTemp.map((design) => {
            const templateDesign = design
            return this.eventTemplateDesignModel.createUidDoc(uid, {
                ...templateDesign,
                templateId: newTemplateDoc.id
            })
        })
        const designDocs: ITemplateDesign[] = await Promise.all(designDocPromises) as ITemplateDesign[]
        const designIds = designDocs.map(doc => doc.id ?? '')
        eventTemplate.designIds = designIds

        // 更新template
        const data = {
            designIds,
        }
        const dataAccessOptions = {
            count: {
                absolute: 1 // 如果不是1，就是符合條件統一改寫
            },
            merge: true,
        }
        const lastmod = await this.eventTemplateModel.setUidDocField(uid, data, dataAccessOptions)
        return lastmod
    }

    async getTemplate(uid: string): Promise<IEventTemplate> {
        const eventTemplate: IEventTemplate = await this.eventTemplateModel.querySingleDoc([['uid', '==', uid]], {
            count: {
                range: [0, 1]
            }
        })
        const designIds = eventTemplate.designIds || []
        // 自動修正樣板資料
        const correctedIds = designIds.filter(id => !!id)
        this.eventTemplateModel.setUidDocField(uid, {
            designIds: correctedIds,
        }, { count: { absolute: 1 } })
        // 取得details並回傳
        const designPromises = await designIds.map((designId: string) => {
            return this.eventTemplateDesignModel.getByDocId(designId)
        })
        const eventTemplateDesigns = await Promise.all(designPromises) as ITemplateDesign[]
        eventTemplate.designs = eventTemplateDesigns
        return eventTemplate
    }

    async postDesign(uid: string, data: IPostTemplateDesignReq): Promise<string> {
        const templateDesign: ITemplateDesign = {
            templateId: data.templateId,
            type: data.type,
        }
        const newDesign = await this.eventTemplateDesignModel.createUidDoc(uid, templateDesign)
        return newDesign.id
    }

    async deleteTemplate(uid: string, id: string): Promise<number> {
        const oldTemplate: IEventTemplate = await this.eventTemplateModel.querySingleDoc([['uid', '==', uid]])
        const designIds = oldTemplate.designIds ?? []
        const promises = designIds.map(designId => {
            return this.deleteTemplateDesign(uid, designId)
        })
        await Promise.all(promises)
        const count = await this.eventTemplateModel.removeDocs([['uid', '==', uid]], {
            count: {
                absolute: 1
            }
        })
        return count
    }

    async patchTemplate(uid: string, designIds: string[]): Promise<string> {
        const data = {
            designIds
        }
        const options = {
            count: {
                absolute: 1,
            }
        }
        const lastmod = await this.eventTemplateModel.setUidDocField(uid, data, options)
        return lastmod
    }
    async patchTemplateDesign(uid: string, payload: IPatchTemplateDesignReq) {
        const lastmod = await this.eventTemplateDesignModel.patchMutable(uid, payload.id, payload.mutable)
        return lastmod
    }

    async deleteTemplateDesign(uid: string, id: string): Promise<number> {
        const options = {
            count: {
                absolute: 1
            }
        }
        const count = await this.eventTemplateDesignModel.removeDocs(
            [['uid', '==', uid], ['id', '==', id]],
            options
        )
        return count
    }
}