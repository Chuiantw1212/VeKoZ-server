import Firestore from '../adapters/Firestore.out'
import { IUser, IUserDesign } from '../entities/user'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class UserDesignModel extends Firestore {
    constructor(data: IModelPorts) {
        super(data)
    }

    async setUserDesignById(uid: string, designId: string, design: IUserDesign) {
        const options: ICrudOptions = {
            count: {
                absolute: 1
            },
            merge: true
        }
        // 對Blob特殊處理
        if (design.type === 'avatar' && typeof design.value !== 'string') {
            // const publicUrl = await this.storeAvatar(designId, design.value)
            // design.value = publicUrl
        }
        const count = await super.setItemById(uid, designId, design, options)
        return count
    }

    // private storeAvatar(designId: string, design: any) {
    //     if (!banner) {
    //         return ''
    //     }
    //     if (banner && typeof banner === 'string') {
    //         throw "typeof banner === 'string'"
    //     }
    //     const imageType = banner.type
    //     const buffer: ArrayBuffer = banner.buffer
    //     if (!imageType) {
    //         return ''
    //     }
    //     try {
    //         await this.publicBucket.deleteFiles({
    //             prefix: `eventTemplateDesign/${id}`,
    //         },)
    //     } catch (error) {
    //         // 可能會因為沒資料可刪出錯
    //     }
    //     const blob = this.publicBucket.file(`eventTemplateDesign/${id}/banner.${imageType}`)
    //     const blobStream = blob.createWriteStream({
    //         resumable: false,
    //     })
    //     const typedResult = Buffer.from(buffer)
    //     // save buffer
    //     blobStream.end(typedResult)
    //     const publicUrl = blob.publicUrl()
    //     return publicUrl
    // }

    /**
        * 建立品項
        * @param uid 
        * @param userDesign 
        * @returns 
        */
    async createDesign(uid: string, userDesign: IUserDesign) {
        return await super.createItem(uid, userDesign)
    }

    /**
     * @param id 
     * @returns 
     */
    async getUserDesignById(id: string): Promise<IUser> {
        const items: IUser[] = await super.getItemsByQuery([['id', '==', id]], {
            count: {
                range: [0, 1]
            }
        }) as IUser[]
        return items[0]
    }
}