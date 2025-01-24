import type { ISelectMap, ISelectDocData } from '../../entities/select'
import SelectModel from '../Select.model'
interface Idependency {
    model: SelectModel
}
export default class EventService {
    selectModel: SelectModel = null as any
    constructor(dependency: Idependency) {
        const { model } = dependency
        this.selectModel = model
    }
}