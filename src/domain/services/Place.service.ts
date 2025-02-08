import PlaceModel from '../Place.model'
import type { IPlace } from '../../entities/place';

interface Idependency {
    placeModel: PlaceModel;
}
export default class PlaceService {
    protected placeModel: PlaceModel = null as any

    constructor(dependency: Idependency) {
        const {
            placeModel,
        } = dependency
        this.placeModel = placeModel
    }

    /**
     * 新增空間
     * @param uid UserUid
     * @param place 
     */
    newItem(uid: string, place: IPlace) {
        return this.placeModel.createItem(uid, place)
    }

    /**
     * 取得空間
     */
    async getItem(uid: string, id: string) {
        return await this.placeModel.getPlaceById(uid, id)
    }

    /**
     * 取得列表
     * @returns 
     */
    async getDocList() {
        const list: IPlace[] = await this.placeModel.getDocList()
        return list
    }

    /**
     * 刪除空間
     * @param id 
     * @returns 
     */
    async deleteItemById(uid: string, id: string) {
        return await this.placeModel.deleteItemById(uid, id)
    }

    /**
     * 更新使用者自己建立的
     * @param uid 使用者uid
     * @param id 文檔id
     * @returns 
     */
    async mergePlaceById(uid: string, id: string, data: any) {
        return await this.placeModel.mergePlaceById(uid, id, data)
    }
}