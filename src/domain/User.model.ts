import Firestore from '../adapters/Firestore.adapter'
import { IUser } from '../entities/user'
import type { IModelPorts } from '../ports/out.model'

export default class UserModel extends Firestore {
    constructor(data: IModelPorts) {
        super(data)
    }
    async createUser(uid: string, user: IUser) {
        return super.createItem(uid, user)
    }
}