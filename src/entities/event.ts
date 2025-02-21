/**
 * 盡可能最小化，節省索引空間
 * https://schema.org/Event
 */
export interface IEvent extends IEventSEO {
    // [key: string]: any
    uid?: string;
    id?: string; // doc id
    // DetailIds
    designIds?: string[],
    dateDesignId?: string, // 從月曆拉動活動日期時，使用dateDesignId去更新對應套版設計的資料欄位
    locationId?: string
    offerIds?: string[]
}
interface IEventSEO extends IEventQuery {
    banner?: string,
    name?: string,
    description?: string,
    performerNames?: string[],
    performerIds?: string[],
    organizerName?: string, // organizerName
    organizerLogo?: string,
}
export interface IEventQuery {
    organizerId?: string,
    startDate?: any,
    startHour?: string,
    endDate?: any,
    keywords?: string[] | string,
    locationAddressRegion?: string,
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