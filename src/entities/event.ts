export interface IEvent {
    [key: string]: any
    name?: string;
    uid?: string;
    id?: string; // doc id
    description?: string,
    startDate?: string,
    endDate?: string,
}