import VekozModel from '../adapters/VekozModel.out'
import type { IModelPorts } from '../ports/out.model'
import { IOrganization, IOrganizationQuery } from '../entities/organization';
import { ICrudOptions } from '../ports/out.crud';
interface IBlob {
    type: string;
    buffer: Buffer,
}

export default class OrganizationModel extends VekozModel {

    constructor(data: IModelPorts) {
        super(data)
    }
    /**
     * 組織名稱不可重複
     * @param uid 
     * @param organization 
     * @returns 
     */
    async createOrganization(uid: string, organization: IOrganization): Promise<IOrganization | number> {
        const query = await super.getQuery([['uid', '==', uid], ['name', '==', organization.name]])
        const count = await super.checkQueryCount(query, {
            absolute: 0,
        })
        if (count === 0) {
            const newOrganization = await super.createItem(uid, organization)
            newOrganization.seoName = newOrganization.id
            super.setItemById(uid, newOrganization.id, {
                seoName: newOrganization.id,
            })
            return newOrganization as IOrganization
        } else {
            return count
        }
    }

    /**
     * 儲存組織Logo
     * @param id 公開的DocId
     * @param logo 
     * @returns 
     */
    async storeLogo(organizationId: string, logo: IBlob) {
        const publicUrl = await super.uploadUniqueImage(`${organizationId}/logo`, logo)
        return publicUrl
    }

    async storeBanner(organizationId: string, banner: IBlob) {
        const publicUrl = await super.uploadUniqueImage(`${organizationId}/banner`, banner)
        return publicUrl
    }

    /**
     * 取得商標連結
     * @param id 
     * @returns 
     */
    async getLogoUrl(id: string): Promise<string> {
        const result = await super.getFieldById(id, 'logo',) as string
        return result
    }

    /**
     * 刪除組織
     * @param uid 使用者uid
     * @param id 文件id
     * @returns 
     */
    async deleteItem(uid: string, id: string) {
        const wheres = [['uid', '==', uid]]
        const query = await super.getQuery(wheres)
        const count = await super.checkQueryCount(query)
        if (count <= 1) {
            throw '不可刪除最後的用戶組織'
        }
        await super.deleteItemById(uid, id) // 先用uid控權限
        await super.deleteBlobFolderById(id)
        return true
    }

    async getOrganizationById(id: string) {
        const organization = await super.getItemById(id)
        return organization
    }

    async mergeOrganizationById(uid: string, id: string, organization: IOrganization): Promise<number> {
        const options: ICrudOptions = {
            merge: true,
            count: {
                absolute: 1
            }
        }
        const count = super.setItemsByQuery([['uid', '==', uid], ['id', '==', id]], organization, options)
        return count
    }

    async getOrganizationList(query: IOrganizationQuery,) {
        const wheres = []
        if (query.keywords) {
            wheres.push(['keywords', 'array-contains-any', query.keywords])
        }
        const organizationList = await super.getItemsByWheres(wheres) as IOrganization[]
        /**
         * 3 INVALID_ARGUMENT: 'NOT_IN' cannot be used in the same query with 'IN', 'ARRAY_CONTAINS_ANY' or 'OR'.
         */
        // // console.log({
        // //     query
        // // })
        // if (query.excludeIds) {
        //     console.log(query.excludeIds)
        //     let excludeIds = query.excludeIds
        //     if (typeof query.excludeIds === 'string') {
        //         excludeIds = String(query.excludeIds).split(',')
        //     }
        //     console.log(excludeIds)
        //     wheres.push(['id', 'not-in', excludeIds])
        // }
        return organizationList
    }

    /**
     * 單一功能更新追蹤者
     * @param userId 
     * @param count 
     */
    async setFollowerCount(organizationId: string, count: number) {
        const options: ICrudOptions = {
            merge: true,
        }
        super.setItemsByQuery([['id', '==', organizationId]], {
            followerCount: count,
        }, options)
    }
}