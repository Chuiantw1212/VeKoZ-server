import Firestore from '../adapters/VekozModel.out'
import { IUser } from '../entities/user'
import { ICrudOptions } from '../ports/out.crud'
import type { IBlob, IModelPorts } from '../ports/out.model'

export default class UserModel extends Firestore {
    constructor(data: IModelPorts) {
        super(data)
    }

    async uploadAvatar(id: string, avatar: IBlob): Promise<string> {
        const publicUrl = await super.uploadUniqueImage(`${id}/avatar`, avatar)
        return publicUrl
    }

    /**
     * 取得用戶資料，這邊並不會拿到偏好資料，而且應該用白名單確保個資不流出
     */
    async getPublicInfo(field: string, value: string) {
        const users: IUser[] = await super.getItemsByQuery([[field, '==', value]], {
            count: {
                range: [0, 1]
            }
        }) as IUser[]
        const user = users[0]
        const publicUser: IUser = {}
        const fieldWhiteList: string[] = ['id', 'description', 'name', 'seoName', 'seoTitle', 'avatar', 'sameAs']
        fieldWhiteList.forEach(field => {
            publicUser[field] = user[field]
        })
        return publicUser
    }

    /**
     * 取得用戶，確保沒有權限的人永遠找不到其他用戶的資料
     * @param uid 
     * @returns 
     */
    async getUserByUid(uid: string): Promise<IUser> {
        const users: IUser[] = await super.getItemsByQuery([['uid', '==', uid]], {
            count: {
                range: [0, 1]
            }
        }) as IUser[]
        return users[0]
    }

    async createUser(uid: string, user: IUser) {
        const createdUser: IUser = await super.createItem(uid, user) as IUser
        return createdUser
    }

    async checkSeoNameAvailable(uid: string, seoName: string): Promise<boolean> {
        const query = await super.getQuery([['uid', '!=', uid], ['seoName', '==', seoName]])
        const count = await super.checkQueryCount(query)
        return !count
    }

    /**
     * 
     * @param uid 
     */
    async setUser(uid: string, user: IUser) {
        delete user.preference
        const options: ICrudOptions = {
            merge: true,
            count: {
                absolute: 1
            }
        }
        const count = await super.setItemsByQuery([['uid', '==', uid]], user, options)
        // await super.setItemById(uid, String(user.id), user, options)
        return count
    }
}