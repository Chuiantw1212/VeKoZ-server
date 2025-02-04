/**
 * https://schema.org/Organization
 */

export interface IEventTemplate {
    [key: string]: any
    uid?: string;
    id?: string; // doc id
    designs?: ITemplateDesign[]
    designIds?: string[]
}

export interface ITemplateDesign {
    id?: string,
    type: string,
    mutable: ITemplateDesignMutable,
    templateId?: string,
}

export interface ITemplateDesignMutable {
    label?: string,
    value?: any,
}

export interface IPostTemplateDesignReq {
    type: string,
    destination: string,
    templateId: string,
    // templateDesignIds: string[]
}

export interface IDeleteTemplateDesignReq {
    id: string,
    templateId: string,
    templateDesignIds: string[]
}

export interface IPatchTemplateDesignReq {
    id: string,
    mutable: any,
}