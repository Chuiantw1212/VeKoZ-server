import { IPagination } from "./meta";

/**
 * https://schema.org/Organization
 */
export interface IOrganization extends IOrganizationQuery {
    uid?: string;
    id?: string; // doc id
    banner?: string;
    logo?: string;
    seoName?: string,
    description?: string,
    sameAs?: string[],
    email?: string, // 聯絡用email
    image?: string,
    googleCalendarId?: string,
}

export interface IOrganizationQuery {
    name?: string;
    keywords?: string[],
    excludeIds?: string[],
    hasPlace?: boolean,
}

export interface IOrganizationMember extends IOrganizationMemberQuery {
    uid?: string, // 權限uid
    id?: string,
    name?: string,
    organizationName?: string,
    organizationLogo?: string,
    isFounder?: boolean, // 創辦者資料的刪除修改方式不同
    calendarColor?: string,
}

export type IAllowMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | string

export interface IOrganizationMemberQuery extends IPagination {
    organizationId?: string,
    organizationIds?: string[] | string,
    email?: string,
    allowEntities?: 'organizationMember'[],
    allowMethods?: IAllowMethod[],
}