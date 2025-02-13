import Firestore from '../adapters/Firestore.adapter'
import { IUser } from '../entities/user'
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
        return super.createItem(uid, user)
    }
}