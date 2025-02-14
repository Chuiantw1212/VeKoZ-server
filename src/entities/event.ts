export interface IEvent {
    [key: string]: any
    name?: string;
    uid?: string;
    id?: string; // doc id
    description?: string,
    startDate?: string,
    endDate?: string,
    dateDesignId?: string,
    locationAddress?: string,
    locationName?: string,
    virtualLocationName?: string,
    virtualLocationUrl?: string,
    attachments?: EventAttachment[]
}

export interface EventAttachment {
    url?: string,
    name?: string,
    type?: string,
    id?: string,
}