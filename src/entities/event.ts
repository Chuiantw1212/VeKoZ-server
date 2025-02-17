export interface IEvent {
    [key: string]: any
    uid?: string;
    id?: string; // doc id
    // 搜尋&SEO用欄位
    name?: string;
    description?: string,
    startDate?: any,
    endDate?: any,
    image?: string,
    keywords?: string[]
    // 
    locationAddress?: string,
    locationName?: string,
    virtualLocationName?: string,
    virtualLocationUrl?: string,
    // Email 附件夾帶
    attachments?: EventAttachment[],
    designIds?: string[],
    isPublic?: boolean,
    // 特殊，更新月曆使用
    dateDesignId?: string, // 從月曆拉動活動日期時，使用dateDesignId去更新對應套版設計的資料欄位
}

export interface EventAttachment {
    url?: string,
    name?: string,
    type?: string,
    id?: string,
}