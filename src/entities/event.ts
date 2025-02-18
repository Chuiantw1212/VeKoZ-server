export interface IEventQuery {
    startDate?: any,
    endDate?: any,
    keywords?: any,
    addressRegion?: string,
    includeVirtualLocation: boolean,
    timeFrame?: string,
    isPublic?: boolean,
}

// 盡可能最小化，節省空間
export interface IEvent {
    [key: string]: any
    uid?: string;
    id?: string; // doc id
    // SEO與陳列用欄位
    image?: string,
    name?: string;
    description?: string,
    // 搜尋用
    startDate?: any,
    endDate?: any,
    keywords?: any,
    addressRegion?: string,
    hasVirtualLocation?: boolean, // 預設為true, 排除時再設定為false
    //
    designIds?: string[],
    isPublic?: boolean,
    // 特殊，更新月曆使用
    dateDesignId?: string, // 從月曆拉動活動日期時，使用dateDesignId去更新對應套版設計的資料欄位
}

export interface IEventEmail {
    // Email 附件夾帶
    attachments?: EventAttachment[],
}

export interface EventAttachment {
    url?: string,
    name?: string,
    type?: string,
    id?: string,
}