import Firestore from '../adapters/VekozModel.out'
import { IUserPreference } from '../entities/user'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class UserPreferenceModel extends Firestore {
    constructor(data: IModelPorts) {
        super(data)
    }

    async createPreference(uid: string, preference: IUserPreference): Promise<IUserPreference> {
        const createdItem = await super.createItem(uid, preference)
        return createdItem as IUserPreference
    }

    async setPreference(uid: string, preference: IUserPreference): Promise<number> {
        const count = await super.setItemsByQuery([['uid', '==', uid]], preference, {
            merge: true,
            count: {
                range: [0, 1]
            }
        })
        return count
    }

    /**
     * 取得用戶偏好
     * @param id 
     * @returns 
     */
    async getPreference(id: string): Promise<IUserPreference> {
        const users: IUserPreference[] = await super.getItemsByQuery([['id', '==', id]], {
            count: {
                range: [0, 1]
            }
        }) as IUserPreference[]
        return users[0]
    }

    /**
     * U 增加追蹤對象
     */
    async addFollowee(uid: string, followeeId: string) {
        const preferences = await super.getItemsByQuery([['uid', '==', uid]], {
            count: {
                absolute: 1,
            }
        }) as IUserPreference[]
        const userPreference = preferences[0]
        if (userPreference.follow.followeeIds && !userPreference.follow.followeeIds.includes(followeeId)) {
            userPreference.follow.followeeIds?.push(followeeId)
            this.setPreference(uid, userPreference)
        }
    }

    /**
    * U 移除追蹤對象
    */
    async removeFollowee(uid: string, followeeId: string) {
        const preferences = await super.getItemsByQuery([['uid', '==', uid]], {
            count: {
                absolute: 1,
            }
        }) as IUserPreference[]
        const userPreference = preferences[0]
        // console.log({
        //     userPreference,
        //     followeeId
        // })
        const index = userPreference.follow.followeeIds?.findIndex(id => {
            return id === followeeId
        })
        if (index && index !== -1) {
            userPreference.follow.followeeIds?.splice(index, 1);
            this.setPreference(uid, userPreference)
        }
    }
}