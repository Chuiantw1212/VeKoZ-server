import pg from 'pg'
const { Pool } = pg

/**
 * Todo，未來有獲利再改成使用Cloud SQL取資料
 */
export class PostgreAdapter {
    pool: any
    async initializeSync() {
        this.pool = new Pool()
    }
}