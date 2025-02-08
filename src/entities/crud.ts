import { IFirestoreOptions } from "./firestore"

export default abstract class VenoniaCRUD {
    /**
     * 創造一筆資料
     * @param uid 
     * @param data 
     * @param options 
     * @returns 
     */
    protected async createItem(uid: string, data: any, options?: IFirestoreOptions): Promise<any> {
        return new Promise(() => { })
    }
    /**
     * 用條件查詢資料列表
     * @param wheres 查詢條件
     * @param options 
     * @returns 
     */
    protected async getItemsByQuery(wheres: any[][], options?: IFirestoreOptions): Promise<any[]> {
        return new Promise(() => { })
    }
    /**
     * 用id取得一筆資料
     * @param id 
     * @param data 
     * @param options 
     * @returns 
     */
    protected async getItemById(id: string, data: any, options?: IFirestoreOptions): Promise<any> {
        return new Promise(() => { })
    }
    /**
     * 用條件更新資料列表
     * @param wheres 
     * @param options 
     * @returns 
     */
    protected async setItemsByQuery(wheres: any[][], data: any, options: IFirestoreOptions): Promise<number> {
        return new Promise(() => { })
    }
    /**
     * 用id更新一筆資料
     * @param docId 
     * @param data 
     * @param options 
     * @returns 
     */
    protected async setItemById(docId: string, data: any, options: IFirestoreOptions): Promise<number> {
        return new Promise(() => { })
    }
}