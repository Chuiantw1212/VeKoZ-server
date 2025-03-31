import VekozModel from '../adapters/VekozModel.out'
import { IPlace, IPlaceQuery } from '../entities/place'
import type { IModelPorts } from '../ports/out.model'

export default class PlaceModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }
    /**
     * C
     * @param uid 
     * @param place 
     * @returns 
     */
    async createItem(uid: string, place: IPlace) {
        return super.createItem(uid, place)
    }

    /**
     * R
     * @param uid 
     * @param id 
     * @returns 
     */
    async getPlaceById(uid: string, id: string): Promise<IPlace> {
        const items = await super.getItemsByQuery([['uid', '==', uid], ['id', '==', id]], {
            count: {
                absolute: 1
            }
        }) as IPlace[]
        return items[0]
    }

    /**
     * R
     * @param organizationId 
     * @returns 
     */
    async countByOrganizationId(organizationId: string) {
        const wheres = [['organizationId', '==', organizationId]]
        const query = await super.getQuery(wheres)
        const count = await super.checkQueryCount(query)
        return count
    }

    /**
     * R
     * @param query 
     * @returns 
     */
    async getPlaceList(query: IPlaceQuery) {
        const wheres = []
        if (query.uid) {
            wheres.push(['uid', '==', query.uid])
        }
        if (query.uids) {
            wheres.push(['uid', 'in', query.uids])
        }
        if (query.email) {
            wheres.push(['email', '==', query.email])
        }
        let organizationIds = query.organizationIds
        if (query.organizationIds) {
            if (typeof query.organizationIds === 'string') {
                organizationIds = query.organizationIds.split(',')
            }
            if (Array.isArray(organizationIds) && organizationIds.length) {
                wheres.push(['organizationId', 'in', organizationIds])
            }
        }
        if (query.organizationId) {
            wheres.push(['organizationId', '==', query.organizationId])
        }
        const placeList = await super.getItemsByQuery(wheres) as IPlace[]
        return placeList
    }

    /**
     * U 只有被updateOrganization使用更新組織名稱與Logo
     * @param uid 
     * @param organizationId 
     * @param place 
     * @returns 
     */
    async mergeByOrganizationId(uid: string, organizationId: string, place: IPlace) {
        const count = await super.setItemsByQuery([['organizationId', '==', organizationId]], place, {
            merge: true,
        })
        return count
    }

    /**
     * U
     * @param uid 
     * @param id 
     * @param place 
     * @returns 
     */
    async mergePlaceById(uid: string, id: string, place: IPlace) {
        const count = await super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], place, {
            merge: true,
            count: {
                absolute: 1
            }
        })
        return count
    }

    /**
     * D
     * @param uid 
     * @param id 
     * @returns 
     */
    async deletePlaceById(uid: string, id: string) {
        const count = await super.deleteItemById(uid, id, {
            count: {
                range: [0, 1]
            }
        })
        return count
    }

}