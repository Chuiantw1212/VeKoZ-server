export interface IEvent {
    [key: string]: any
    name?: string;
    uid?: string;
    id?: string; // doc id
    description?: string,
    startDate?: any,
    endDate?: any,
    dateDesignId?: string, // 從月曆拉動活動日期時，使用dateDesignId去更新對應套版設計的資料欄位
    locationAddress?: string,
    locationName?: string,
    virtualLocationName?: string,
    virtualLocationUrl?: string,
    attachments?: EventAttachment[],
    designIds?: string[],
}

export interface EventAttachment {
    url?: string,
    name?: string,
    type?: string,
    id?: string,
}