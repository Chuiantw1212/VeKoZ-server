/**
 * https://schema.org/FollowAction
 */
export interface IUserFollow extends IUserFollowQuery {
    followeeType?: string,
    followeeName?: string,
    followeeImage?: string,
    name?: string,
    image?: string,
}

export interface IUserFollowQuery {
    uid?: string,
    id?: string,// userId
    followeeId?: string,
    followeeSeoName?: string,
}