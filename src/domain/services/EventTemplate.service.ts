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
     * 取得列表
     * @param uid 
     * @returns 
     */
    async getEventTemplateList(uid: string) {
        const eventTemplateMasterList: IEventTemplate[] = await this.eventTemplateModel.getTemplateList(uid)
        // const eventTemplateList = eventTemplateMasterList.map((eventTemplate: IEventTemplate) => {
        //     return this.getTemplate(uid, eventTemplate.id)
        // })
        return eventTemplateMasterList
    }

    /**
     * 如果需要取出，使用get取出嗎？
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async addEventTemplate(uid: string, eventTemplate: IEventTemplate): Promise<IEventTemplate> {
        if (!eventTemplate.designs?.length) {
            throw 'designs不存在'
        }
        // 深拷貝designs
        const designsTemp = eventTemplate.designs
        delete eventTemplate.designs
        // 儲存template
        const insertedEventTemplate: IEventTemplate = await this.eventTemplateModel.createTemplate(uid, eventTemplate)
        // 儲存欄位design
        const designDocPromises = designsTemp.map((design) => {
            design.templateId = insertedEventTemplate.id
            return this.eventTemplateDesignModel.createTemplateDesign(uid, design)
        })
        const designDocs: ITemplateDesign[] = await Promise.all(designDocPromises) as ITemplateDesign[]
        const designIds = designDocs.map(doc => doc.id ?? '')
        // 更新template
        await this.eventTemplateModel.mergeDesignIds(uid, designIds)
        // 取得新的Template
        const newTemplateDoc = await this.getTemplate(uid, String(insertedEventTemplate.id))
        if (newTemplateDoc) {
            return newTemplateDoc
        }
        throw '創建樣板過程有錯誤'
    }

    /**
     * 因為目前一個人只會有一個樣板可編輯，所以id是可選的
     * @param uid 
     * @param id 
     * @returns 
     */
    async getTemplate(uid: string, id?: string): Promise<IEventTemplate | 0> {
        const eventTemplate: IEventTemplate | 0 = await this.eventTemplateModel.readTemplateById(uid, id)
        if (eventTemplate) {
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
            delete eventTemplate.designIds
            return eventTemplate
        }
        return 0
    }

    async postDesign(uid: string, data: IPostTemplateDesignReq): Promise<string> {
        const templateDesign: ITemplateDesign = {
            templateId: data.templateId,
            type: data.type,
            mutable: { // 必要的，不然會顯示出錯
                label: '',
            }
        }
        const newDesign = await this.eventTemplateDesignModel.createTemplateDesign(uid, templateDesign)
        return newDesign.id
    }

    async deleteTemplate(uid: string, id: string): Promise<number> {
        const oldTemplate = await this.eventTemplateModel.readTemplateById(uid, id)
        if (oldTemplate) {
            const designIds = oldTemplate.designIds ?? []
            const promises = designIds.map(designId => {
                return this.deleteDesignById(uid, designId)
            })
            await Promise.all(promises)
            const count = await this.eventTemplateModel.deleteTemplate(uid)
            return count
        }
        return 0
    }

    async patchTemplate(uid: string, designIds: string[]): Promise<number> {
        const count = await this.eventTemplateModel.mergeDesignIds(uid, designIds)
        return count
    }
    async patchTemplateDesign(uid: string, payload: IPatchTemplateDesignReq) {
        const lastmod = await this.eventTemplateDesignModel.patchMutable(uid, payload.id, payload.mutable)
        return lastmod
    }

    async deleteDesignById(uid: string, id: string): Promise<number> {
        return this.eventTemplateDesignModel.deleteDesignById(uid, id)
    }
}