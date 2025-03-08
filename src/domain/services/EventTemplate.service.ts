import type { IEventTemplate, ITemplateDesign, IPostTemplateDesignReq, IPatchTemplateDesignReq, IEventTemplateQuery } from '../../entities/eventTemplate';
import { IOrganizationMember } from '../../entities/organization';
import EventTemplateModel from '../EventTemplate.model'
import EventTemplateDesignModel from '../EventTemplateDesign.model';
import OrganizationMemberModel from '../OrganizationMember.model';

interface Idependency {
    eventTemplateModel: EventTemplateModel;
    eventTemplateDesignModel: EventTemplateDesignModel
    organizationMemberModel: OrganizationMemberModel
}

export default class EventTemplateService {
    protected eventTemplateModel: EventTemplateModel
    protected eventTemplateDesignModel: EventTemplateDesignModel
    protected organizationMemberModel: OrganizationMemberModel

    constructor(dependency: Idependency) {
        const {
            eventTemplateModel,
            eventTemplateDesignModel,
            organizationMemberModel,
        } = dependency
        this.eventTemplateModel = eventTemplateModel
        this.eventTemplateDesignModel = eventTemplateDesignModel
        this.organizationMemberModel = organizationMemberModel
    }

    /**
     * 取得列表
     * @param uid 
     * @returns ｀
     */
    async getTemplateMasterList(member: IOrganizationMember, query: IEventTemplateQuery) {
        const eventTemplateMasterList: IEventTemplate[] = await this.eventTemplateModel.getTemplateList(String(member.uid), query)
        eventTemplateMasterList.forEach(template => {
            delete template.designIds
            template.allowMethods = member.allowMethods
        })
        return eventTemplateMasterList
    }

    /**
     * 如果需要取出，使用get取出嗎？
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async addEventTemplate(uid: string, eventTemplate: IEventTemplate): Promise<IEventTemplate> {
        if (!eventTemplate.designs || !eventTemplate.organizerId) {
            throw '新增模板資料有誤'
        }
        // 暫存designs
        const designsTemp = eventTemplate.designs
        delete eventTemplate.designs
        // 給預設未命名
        if (!eventTemplate.name) {
            eventTemplate.name = '未命名模板'
        }
        // 儲存template
        const insertedEventTemplate: IEventTemplate = await this.eventTemplateModel.createTemplate(uid, eventTemplate)
        // 儲存欄位design
        const designDocPromises = designsTemp.map((design: ITemplateDesign) => {
            delete design.id // 避免模板值互相干擾
            design.templateId = insertedEventTemplate.id
            return this.eventTemplateDesignModel.createTemplateDesign(uid, design)
        })
        const designDocs: ITemplateDesign[] = await Promise.all(designDocPromises) as ITemplateDesign[]
        const designIds = designDocs.map(doc => doc.id ?? '')
        // 更新template
        await this.eventTemplateModel.mergeTemplate(uid, String(insertedEventTemplate.id), {
            designIds
        })
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
    async getTemplate(uid: string, id: string): Promise<IEventTemplate | 0> {
        const eventTemplate: IEventTemplate | 0 = await this.eventTemplateModel.readTemplateById(uid, id)
        if (eventTemplate) {
            const designIds = eventTemplate.designIds || []
            const validDesignIds = designIds.filter(id => {
                return id && id !== 'undefined'
            })
            if (designIds.length !== validDesignIds.length) {
                // 自動(?)修正錯誤的templateDesigns
                this.eventTemplateModel.mergeTemplate(uid, id, {
                    designIds: validDesignIds,
                })
            }
            // 取得details並回傳
            const designPromises = validDesignIds.map((designId: string) => {
                return this.eventTemplateDesignModel.getTemplateDesign(designId)
            })
            const eventTemplateDesigns = await Promise.all(designPromises) as any[]
            eventTemplate.designs = eventTemplateDesigns
            delete eventTemplate.designIds
            this.eventTemplateModel.mergeTemplate(uid, id, {
                lastmod: true,
            }) // 更新lastmod
            return eventTemplate
        }
        return 0
    }

    async postDesign(uid: string, data: IPostTemplateDesignReq): Promise<string> {
        const templateDesign: ITemplateDesign = Object.assign({
            label: '',
        }, data)
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
            const count = await this.eventTemplateModel.deleteTemplate(uid, id)
            return count
        }
        return 0
    }

    async patchTemplate(uid: string, id: string, template: IEventTemplate): Promise<number> {
        const count = await this.eventTemplateModel.mergeTemplate(uid, id, template)
        return count
    }
    async patchTemplateDesign(uid: string, payload: IPatchTemplateDesignReq) {
        const count = await this.eventTemplateDesignModel.patchDesignById(uid, payload.id, payload)
        return count
    }

    async deleteDesignById(uid: string, id: string): Promise<number> {
        return this.eventTemplateDesignModel.deleteDesignById(uid, id)
    }
}