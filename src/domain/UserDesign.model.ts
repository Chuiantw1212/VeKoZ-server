import Firestore from '../adapters/VekozModel.out'
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
        const count = await super.setItemById(uid, designId, design, options)
        return count
    }

    async uploadAvatar(design: IUserDesign) {
        const publicUrl = await super.uploadUniqueImage(String(design.id), design.value)
        return publicUrl
    }

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