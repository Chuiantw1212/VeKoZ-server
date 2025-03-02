import VekozModel from '../adapters/VekozModel.out'
import type { IModelPorts } from '../ports/out.model'
import { IOrganization } from '../entities/organization';
import { ICrudOptions } from '../ports/out.crud';
interface IBlob {
    type: string;
    buffer: Buffer,
}

export default class OrganizationModel extends VekozModel {

    constructor(data: IModelPorts) {
        super(data)
    }

    async createOrganization(uid: string, organization: IOrganization): Promise<IOrganization> {
        const newOrganization = await super.createItem(uid, organization)
        return newOrganization as IOrganization
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

    async getOrganizationList(uid: string,) {
        const organizationList = await super.getItemsByQuery([['uid', '==', uid]]) as IOrganization[]
        return organizationList
    }
}