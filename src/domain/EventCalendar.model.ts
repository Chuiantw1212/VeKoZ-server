import VekozModel from '../adapters/VekozModel.out'
import type { IModelPorts } from '../ports/out.model'
import { IEventTemplate } from '../entities/eventTemplate'

export default class EventCalendarModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }

    /**
     * 新增
     * @param uid 
     * @param eventTemplate 
     * @returns 
     */
    async createEvent(uid: string, eventTemplate: IEventTemplate): Promise<IEventTemplate> {
        const newEventDoc: IEventTemplate = await super.createItem(uid, eventTemplate)
        return newEventDoc
    }
}