/**
 * https://schema.org/Organization
 */

export interface IEventTemplate {
    [key: string]: any
    uid?: string;
    id?: string; // doc id
    designs?: ITemplateDesign[]
}

export interface ITemplateDesign {
    id?: string,
    type: string,
    mutable: ITemplateDesignMutable
}

export interface ITemplateDesignMutable {
    label?: string,
    value?: any,
}