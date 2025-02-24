import Firestore from '../adapters/Firestore.adapter'
import { IUser } from '../entities/user'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class UserModel extends Firestore {
    constructor(data: IModelPorts) {
        super(data)
    }

    /**
     * 取得用戶
     * @param uid 
     * @returns 
     */
    async getUser(uid: string): Promise<IUser> {
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
        const count = await super.setItemById(uid, String(user.id), user, options)
        return count
    }
}