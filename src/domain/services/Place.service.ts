import PlaceModel from '../Place.model'
import EventTemplateModel from '../EventTemplate.model';
import type { IPlace, IPlaceQuery } from '../../entities/place';
import OrganizationModel from '../Organization.model';

interface Idependency {
    placeModel: PlaceModel
    organizationModel: OrganizationModel
}

export default class PlaceService {
    private placeModel: PlaceModel
    private organizationModel: OrganizationModel

    constructor(dependency: Idependency) {
        const {
            placeModel,
            organizationModel
        } = dependency
        this.placeModel = placeModel
        this.organizationModel = organizationModel
    }

    /**
     * 新增空間
     * @param uid UserUid
     * @param place 
     */
    async addPlace(uid: string, place: IPlace) {
        const createdResult = await this.placeModel.createItem(uid, place)
        const organizationPlacesCount = await this.placeModel.countByOrganizationId(String(place.organizationId))
        // this.organizationModel.updatePlaceCount()
        return createdResult
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
    async getPlaceList(query: IPlaceQuery) {
        const list: IPlace[] = await this.placeModel.getPlaceList(query)
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