/**
 * https://schema.org/Organization
 */

export interface IPlace extends IPlaceQuery {
    name?: string;
    uid?: string;
    description?: string,
    addressRegion?: string, // 第一級行政區
}

export interface IPlaceQuery {
    id?: string; // doc id
    organizationId?: string,
    organizationName?: string,
    organizationIds?: string[] | string
}