import AccomodationModel from '../Accomodation.model'
import type { IAccomodation } from '../../entities/accomodation';

interface Idependency {
    accomodationModel: AccomodationModel;
}
export default class EventService {
    protected accomodationModel: AccomodationModel = null as any

    constructor(dependency: Idependency) {
        const {
            accomodationModel,
        } = dependency
        this.accomodationModel = accomodationModel
    }

    /**
     * 新增空間
     * @param uid UserUid
     * @param accomodation 
     */
    newItem(uid: string, accomodation: IAccomodation) {
        return this.accomodationModel.createNewDoc(uid, accomodation)
    }

    /**
     * 取得空間
     */
    async getItem(uid: string) {
        return await this.accomodationModel.getUniqueDoc(uid)
    }

    /**
     * 更新空間
     */
    async mergeUniqueDoc(uid: string, accomodation: IAccomodation) {
        return await this.accomodationModel.mergeUniqueDoc(uid, accomodation)
    }

    /**
     * 取得列表
     * @returns 
     */
    async getList() {
        const list: IAccomodation[] = await this.accomodationModel.getList()
        return list
    }

    /**
     * 刪除空間
     * @param id 
     * @returns 
     */
    async deleteItem(id: string) {
        return await this.accomodationModel.deleteByDocId(id)
    }
}