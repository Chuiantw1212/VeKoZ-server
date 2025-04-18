import VekozModel from '../adapters/VekozModel.out'
import type { IModelPorts } from '../ports/out.model'
import { IEventTemplate, IEventTemplateQuery } from '../entities/eventTemplate'
import { ICrudOptions } from '../ports/out.crud'

export default class EventTemplateModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    async devCheckCount(designId: string) {
        const options: ICrudOptions = {
            count: {
                absolute: 1
            }
        }
        const query = await super.getQuery([['designIds', 'array-contains', designId]], options)
        const count = await super.checkQueryCount(query)
        return count
    }

    /**
     * 新增
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async createTemplate(uid: string, eventTemplate: IEventTemplate): Promise<IEventTemplate> {
        const newTemplateDoc: IEventTemplate = await this.createItem(uid, eventTemplate)
        return newTemplateDoc
    }

    async getTemplateList(uid: string, query?: IEventTemplateQuery) {
        const wheres = [['uid', '==', uid]]
        if (query?.organizerId) {
            wheres.push(['organizerId', '==', query.organizerId])
        }
        const templateList = await super.getItemsByQuery(wheres, {
            orderBy: ['lastmod', 'desc'],
        })
        return templateList
    }

    /**
     * 讀取
     * @param uid 
     * @returns 
     */
    async readTemplateById(id: string): Promise<IEventTemplate | 0> {
        const eventTemplate = await super.getItemById(id)
        return eventTemplate
    }

    /**
     * 修改
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async mergeTemplateById(uid: string, id: string, templatePart: IEventTemplate): Promise<number> {
        const dataAccessOptions = {
            count: {
                absolute: 1 // 如果不是1，就是符合條件統一改寫
            },
            merge: true,
        }
        const count = await super.setItemById(uid, id, templatePart, dataAccessOptions)
        return count
    }

    async mergeTemplateByOrganizerId(uid: string, organizerId: string, templatePart: IEventTemplate): Promise<number> {
        const dataAccessOptions = {
            count: {
                min: 0,
            },
            merge: true,
        }
        const wheres = [['uid', '==', uid], ['organizerId', '==', organizerId]]
        const count = await super.setItemsByQuery(wheres, templatePart, dataAccessOptions)
        return count
    }

    /**
     * 刪除
     * @param uid 
     */
    async deleteTemplateById(uid: string, id: string,): Promise<number> {
        const count = await this.deleteItemById(uid, id, {
            count: {
                absolute: 1
            }
        })
        return count
    }
}