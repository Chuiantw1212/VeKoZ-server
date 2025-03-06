export default abstract class VenoniaCRUD {
    /**
     * 創造一筆資料
     * @param uid 這一步的uid是必要的，未來資料控管要使用
     * @param data 
     * @param options 
     * @returns 
     */
    protected async createItem(uid: string, data: any, options?: ICrudOptions): Promise<any> {
        return new Promise(() => { })
    }
    /**
     * 用條件查詢資料列表
     * @param wheres 查詢條件
     * @param options 通常包含uid權限管控用，但現在放在wheres比較簡單
     * @returns 
     */
    protected async getItemsByWheres(wheres: any[][], options?: ICrudOptions): Promise<any[]> {
        return new Promise(() => { })
    }
    /**
     * 用id取得一筆資料
     * @param id 
     * @param data 
     * @param options 通常包含uid權限管控用，但現在放在wheres比較簡單
     * @returns 
     */
    protected async getItemById(id: string, data: any, options?: ICrudOptions): Promise<any> {
        return new Promise(() => { })
    }
    /**
     * 取得特定欄位的資料
     * @param id 
     * @param data 
     * @param options 
     * @returns 
     */
    protected async getFieldById(id: string, field: string) {
        return new Promise(() => { })
    }
    /**
     * 用條件更新資料列表
     * @param wheres 
     * @param options 通常包含uid權限管控用，但現在放在wheres比較簡單
     * @returns 
     */
    protected async setItemsByQuery(wheres: any[][], data: any, options: ICrudOptions): Promise<number> {
        return new Promise(() => { })
    }

    /**
     * 用id更新資料
     * @param id 
     * @param data 
     * @param options 
     * @returns 
     */
    protected async setItemById(id: string, data: any, options?: ICrudOptions) {
        return new Promise(() => { })
    }
    /**
     * 用條件刪除資料
     * @param wheres 
     * @param options 通常包含uid權限管控用，但現在放在wheres比較簡單
     * @returns 
     */
    protected async deleteItemsByQuery(wheres: any[][], options: ICrudOptions): Promise<number> {
        return new Promise(() => { })
    }
    /**
     * 用id刪除資料
     * @param id 
     * @param data 
     * @param options 通常包含uid權限管控用
     * @returns 
     */
    protected async deleteItemById(id: string, data: any, options: ICrudOptions): Promise<number> {
        return new Promise(() => { })
    }
}

export interface ICrudOptions {
    uid?: string, // 資料權限控制
    count?: IDataCountOptions,
    startAfter?: number,
    merge?: boolean,
    limit?: number,
    sort?: string,
    orderBy?: string[],
}

export interface IDataCountOptions {
    min?: number,
    max?: number,
    absolute?: number,
    range?: number[],
    fields?: string[],
}