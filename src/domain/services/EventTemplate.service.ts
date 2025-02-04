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

    async addEventTemplate(uid: string, eventTemplate: IEventTemplate) {
        if (!eventTemplate.designs?.length) {
            throw 'designs不存在'
        }
        // 深拷貝designs
        const designsTemp = structuredClone(eventTemplate.designs)
        delete eventTemplate.designs
        // 儲存template
        const newTemplateDoc: IEventTemplate = await this.eventTemplateModel.createNewDoc(uid, eventTemplate, {
            limit: 1
        })
        // 儲存欄位design
        const designDocPromises = designsTemp.map((design) => {
            const templateDesign = design as ITemplateDesign
            return this.eventTemplateDesignModel.createNewDoc(uid, {
                ...templateDesign,
                templateId: newTemplateDoc.id
            })
        })
        const designDocs: ITemplateDesign[] = await Promise.all(designDocPromises)
        const designDocIds = designDocs.map(doc => doc.id ?? '')
        eventTemplate.designs = designDocIds
        // 更新template
        const lastmod = await this.eventTemplateModel.mergeUniqueDocField(uid, 'designs', designDocIds)
        return lastmod
    }

    async getTemplate(uid: string): Promise<IEventTemplate> {
        const eventTemplate: IEventTemplate = await this.eventTemplateModel.getUniqueDoc(uid)
        const designIds = eventTemplate.designs as string[]
        const designPromises = await designIds.map((designId: string) => {
            return this.eventTemplateDesignModel.getByDocId(designId)
        })
        const eventTemplateDesigns = await Promise.all(designPromises) as ITemplateDesign[]
        eventTemplateDesigns.forEach((design, index) => {
            if (!design) {
                const errorField = designIds[index]
                console.log({
                    errorField
                })
            }
        })
        eventTemplate.designs = eventTemplateDesigns
        return eventTemplate
    }

    async postDesign(uid: string, data: IPostTemplateDesignReq) {
        const templateDesign: ITemplateDesign = {
            templateId: data.templateId,
            type: data.type,
            mutable: {}
        }
        const newDesign = await this.eventTemplateDesignModel.createNewDoc(uid, templateDesign)
        return newDesign.id
    }

    async patchTemplate(uid: string, field: string, designIds: string[]): Promise<string> {
        const lastmod = await this.eventTemplateModel.mergeUniqueDocField(uid, field, designIds)
        return lastmod
    }
    async patchTemplateDesign(uid: string, payload: IPatchTemplateDesignReq) {
        const lastmod = await this.eventTemplateDesignModel.patchMutable(uid, payload.id, payload.mutable)
        return lastmod
    }

    async putTemplate(uid: string, template: IEventTemplate): Promise<string> {
        // // 為每個design mutable建立自己的uuid
        // template.designs?.forEach((design) => {
        //     if (!design.id) {
        //         design.id = crypto.randomUUID()
        //     }
        // })

        // if (template.id) {
        //     return await this.eventTemplateModel.mergeUniqueDoc(uid, template)
        // } else {
        //     return await this.eventTemplateModel.createNewDoc(uid, template)
        // }
    }

    async deleteTemplateDesign(uid: string, deleteReq: IDeleteTemplateDesignReq): Promise<number> {
        const count = await this.eventTemplateDesignModel.deleteByDocId(uid, deleteReq.id)
        return count
    }
}