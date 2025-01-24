/**
 * https://schema.org/Organization
 */

export interface IOrganization {
    [key: string]: any
    name: string;
    uid: string;
    id: string; // doc id
    logo: string;
    founder: string; // 擁有者
}