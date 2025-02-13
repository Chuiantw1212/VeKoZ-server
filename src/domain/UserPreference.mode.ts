import Firestore from '../adapters/Firestore.adapter'
import { IUserPreference } from '../entities/user'
import type { IModelPorts } from '../ports/out.model'

export default class UserPreferenceModel extends Firestore {
    constructor(data: IModelPorts) {
        super(data)
    }

    /**
     * 取得用戶偏好
     * @param uid 
     * @returns 
     */
    async getPreference(uid: string): Promise<IUserPreference> {
        const users: IUserPreference[] = await super.getItemsByQuery([['uid', '==', uid]], {
            count: {
                range: [0, 1]
            }
        }) as IUserPreference[]
        return users[0]
    }
}