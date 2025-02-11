import Firestore from '../adapters/Firestore.out'
import { IUser } from '../entities/user'
import type { IFirestoreAdapters } from '../entities/dataAccess'

export default class UserModel extends Firestore {
    constructor(data: IFirestoreAdapters) {
        super(data)
    }
    async createUser(uid: string, user: IUser) {
        return super.createItem(uid, user)
    }
}