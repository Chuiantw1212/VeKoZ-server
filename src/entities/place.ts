/**
 * https://schema.org/Organization
 */

export interface IPlace extends IPlaceQuery {
    name?: string;
    description?: string,
    addressRegion?: string, // 第一級行政區
}

export interface IPlaceQuery {
    id?: string; // doc id
    uid?: string;
    uids?: string[],
    email?: string,
    organizationId?: string,
    organizationName?: string,
    organizationIds?: string[] | string
}