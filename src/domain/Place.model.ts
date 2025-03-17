import VekozModel from '../adapters/VekozModel.out'
import { IPlace, IPlaceQuery } from '../entities/place'
import type { IModelPorts } from '../ports/out.model'

export default class PlaceModel extends VekozModel {
    constructor(data: IModelPorts) {
        super(data)
    }
    async createItem(uid: string, place: IPlace) {
        return super.createItem(uid, place)
    }
    async getPlaceById(uid: string, id: string): Promise<IPlace> {
        const items = await super.getItemsByWheres([['uid', '==', uid], ['id', '==', id]], {
            count: {
                absolute: 1
            }
        }) as IPlace[]
        return items[0]
    }
    /**
     * 只有被updateOrganization使用更新組織名稱與Logo
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
    async mergePlaceById(uid: string, id: string, place: IPlace) {
        const count = await super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], place, {
            merge: true,
            count: {
                absolute: 1
            }
        })
        return count
    }
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
        const placeList = await super.getItemsByWheres(wheres) as IPlace[]
        // if (query.uids) {
        //     const linkedPlaces = await super.getItemsByWheres([['uid', 'in', query.uids]]) as IPlace[]
        //     placeList.push(...linkedPlaces)
        // }
        return placeList
    }
    async deletePlaceById(uid: string, id: string) {
        const count = await super.deleteItemById(uid, id, {
            count: {
                range: [0, 1]
            }
        })
        return count
    }

}