/**
 * https://schema.org/Organization
 */

export interface IEventTemplate {
    [key: string]: any
    name: string;
    uid?: string;
    id?: string; // doc id
    description: string,
    designs?: IDesign[]
}

export interface IDesign {
    id?: string,
    type: string,
    mutable: IDesignMutable
}

export interface IDesignMutable {
    label?: string,
    value?: any,
}