import Firestore from '../adapters/Firestore.adapter'
import { IUser } from '../entities/user'
import { ICrudOptions } from '../ports/out.crud'
import type { IModelPorts } from '../ports/out.model'

export default class UserDesignModel extends Firestore {
    constructor(data: IModelPorts) {
        super(data)
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