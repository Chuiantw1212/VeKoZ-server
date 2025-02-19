/**
 * 盡可能最小化，節省索引空間
 * https://schema.org/Event
 */
export interface IEvent extends IEventSEO {
    [key: string]: any
    uid?: string;
    id?: string; // doc id
    designIds?: string[],
    dateDesignId?: string, // 從月曆拉動活動日期時，使用dateDesignId去更新對應套版設計的資料欄位
}
interface IEventSEO extends IEventQuery {
    image?: string,
    name?: string,
    description?: string,
    performerNames?: string[],
    performerIds?: string[],
    organizerName?: string, // organizerName
    organizerId?: string,
    placeId?: string, // 如果有owner，可共用評價
    // 未來功能設想
    // contributors?: string[], // 不被搜尋，但可共用評價？
    // placeOwnerId?: string, // 如果有owner，可共用評價
    // placeOwnerName?: string, // 如果有owner，可共用評價
}
export interface IEventQuery {
    startDate?: any,
    endDate?: any,
    keywords?: string[] | string,
    addressRegion?: string,
    hasVirtualLocation?: boolean,
    isPublic?: boolean,
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