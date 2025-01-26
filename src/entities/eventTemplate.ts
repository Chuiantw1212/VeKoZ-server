/**
 * https://schema.org/Organization
 */

export interface IEventTemplate {
    [key: string]: any
    name: string;
    uid?: string;
    id?: string; // doc id
    description: string,
}