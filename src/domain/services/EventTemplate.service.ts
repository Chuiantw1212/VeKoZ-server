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
    async addEventTemplate(uid: string, eventTemplate: IEventTemplate): Promise<number> {
        if (!eventTemplate.designs?.length) {
            throw 'designs不存在'
        }
        // 深拷貝designs
        const designsTemp = structuredClone(eventTemplate.designs)
        delete eventTemplate.designs
        // 儲存template
        const newTemplateDoc: IEventTemplate = await this.eventTemplateModel.createTemplate(uid, eventTemplate)
        // 儲存欄位design
        const designDocPromises = designsTemp.map((design) => {
            design.templateId = newTemplateDoc.id
            return this.eventTemplateDesignModel.createTemplateDesign(uid, design)
        })
        const designDocs: ITemplateDesign[] = await Promise.all(designDocPromises) as ITemplateDesign[]
        const designIds = designDocs.map(doc => doc.id ?? '')
        eventTemplate.designIds = designIds
        // 更新template
        const count = await this.eventTemplateModel.mergeDesignIds(uid, designIds)
        return count
    }

    async getTemplate(uid: string): Promise<IEventTemplate> {
        const eventTemplate: IEventTemplate = await this.eventTemplateModel.readTemplate(uid)
        const designIds = eventTemplate.designIds || []
        // 自動修正樣板資料
        const correctedIds = designIds.filter(id => !!id)
        this.eventTemplateModel.mergeDesignIds(uid, correctedIds)
        // 取得details並回傳
        const designPromises = await designIds.map((designId: string) => {
            return this.eventTemplateDesignModel.getTemplateDesign(designId)
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
        const newDesign = await this.eventTemplateDesignModel.createTemplateDesign(uid, templateDesign)
        return newDesign.id
    }

    async deleteTemplate(uid: string, id: string): Promise<number> {
        const oldTemplate: IEventTemplate = await this.eventTemplateModel.readTemplate(uid, id)
        const designIds = oldTemplate.designIds ?? []
        const promises = designIds.map(designId => {
            return this.deleteTemplateDesign(uid, designId)
        })
        await Promise.all(promises)
        const count = await this.eventTemplateModel.deleteTemplate(uid)
        return count
    }

    async patchTemplate(uid: string, designIds: string[]): Promise<number> {
        const count = await this.eventTemplateModel.mergeDesignIds(uid, designIds)
        return count
    }
    async patchTemplateDesign(uid: string, payload: IPatchTemplateDesignReq) {
        const lastmod = await this.eventTemplateDesignModel.patchMutable(uid, payload.id, payload.mutable)
        return lastmod
    }

    async deleteTemplateDesign(uid: string, id: string): Promise<number> {
        return this.eventTemplateDesignModel.deleteTemplateDesign(uid, id)
    }
}