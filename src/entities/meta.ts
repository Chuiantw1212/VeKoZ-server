export interface IOptionsItem {
    label: string,
    value: string | number,
}

export interface ISelectMap {
    [key: string]: IOptionsItem[];
}

export interface ISelectDocData {
    key: string,
    options: IOptionsItem[]
}

export interface IPagination {
    pageSize: number,
    currentPage: number,
}