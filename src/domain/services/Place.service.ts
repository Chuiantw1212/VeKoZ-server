import PlaceModel from '../Place.model'
import EventTemplateModel from '../EventTemplate.model';
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
    addPlace(uid: string, place: IPlace) {
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
    async getPlaceList() {
        const list: IPlace[] = await this.placeModel.getPlaceList()
        return list
    }

    /**
     * 刪除空間
     * @param id 
     * @returns 
     */
    async deletePlaceById(uid: string, id: string) {
        return await this.placeModel.deletePlaceById(uid, id)
    }

    /**
     * 更新使用者自己建立的
     * @param uid 使用者uid
     * @param id 文檔id
     * @returns 
     */
    async mergePlaceById(uid: string, id: string, data: any) {
        const count = await this.placeModel.mergePlaceById(uid, id, data)
        // 更新模板資料

        return
    }
}