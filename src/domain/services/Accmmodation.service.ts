import AccommodationModel from '../Accommodation.model'
import type { IAccommodation } from '../../entities/accommodation';

interface Idependency {
    accommodationModel: AccommodationModel;
}
export default class AccommodationService {
    protected accommodationModel: AccommodationModel = null as any

    constructor(dependency: Idependency) {
        const {
            accommodationModel,
        } = dependency
        this.accommodationModel = accommodationModel
    }

    /**
     * 新增空間
     * @param uid UserUid
     * @param accommodation 
     */
    newItem(uid: string, accommodation: IAccommodation) {
        return this.accommodationModel.createNewDoc(uid, accommodation)
    }

    /**
     * 取得空間
     */
    async getItem(uid: string) {
        return await this.accommodationModel.getUniqueDoc(uid)
    }

    /**
     * 更新空間
     */
    async mergeUniqueDoc(uid: string, accommodation: IAccommodation) {
        return await this.accommodationModel.mergeUniqueDoc(uid, accommodation)
    }

    /**
     * 取得列表
     * @returns 
     */
    async getList() {
        const list: IAccommodation[] = await this.accommodationModel.getList()
        return list
    }

    /**
     * 刪除空間
     * @param id 
     * @returns 
     */
    async deleteItem(id: string) {
        return await this.accommodationModel.deleteByDocId(id)
    }
}