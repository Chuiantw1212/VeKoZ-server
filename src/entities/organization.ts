/**
 * https://schema.org/Organization
 */
export interface IOrganization {
    uid?: string;
    id?: string; // doc id
    name?: string;
    seoName?: string,
    description?: string,
    sameAs?: string[],
    logo?: string;
    image?: string,
    banner?: string;
    googleCalendarId?: string,
    email?: string, // 聯絡用email
    founderId?: string, // 部分取代uid判定UI使用
    // founderEmail?: string, // 部分取代uid判定權限使用，不可變更
}

export interface IOrganizationMember {
    id?: string,
    name: string,
    organizationId?: string,
    organizationName?: string,
    organizationFounderId?: string,
    // organizationFounderEmail?: string,
    allowMethods?: string[],
    email: string,
}

/**
 * Event Editor 簡單的事件管理
 * Event Owner 所有人的事件管理、樣板設定
 * Organization Editor 
 * Organization Owner 權限以及各種編輯
 * Owner 所有權限
 */
export interface IOrganizationRole {
    [key: string]: any
    organizationId: string,
}