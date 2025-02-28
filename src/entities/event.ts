import type { ITemplateDesign } from "./eventTemplate";

/**
 * 盡可能最小化，節省索引空間
 * https://schema.org/Event
 */
export interface IEvent extends IEventSEO {
    [key: string]: any
    uid?: string;
    id?: string; // doc id
    // DetailIds
    designs?: ITemplateDesign[]
    designIds?: string[],
    dateDesignId?: string, // 從月曆拉動活動日期時，使用dateDesignId去更新對應套版設計的資料欄位
    locationId?: string
    offerCategoryIds?: string[]
    locationAddress?: string,
    eventStatus?: 'cancelled' | 'movedOnline' | 'postponed' | 'rescheduled' | 'scheduled' | 'ended' // 暫定
}
interface IEventSEO extends IEventQuery {
    banner?: string,
    name?: string,
    description?: string,
    performerNames?: string[],
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
    limit?: number,
    performerIds?: string[],
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