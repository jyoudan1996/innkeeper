import { Pool } from 'pg';

export class DatabaseService {
    private static instance: DatabaseService;
    private pool: Pool;

    // psql -h localhost -p 5432 -U uat -d qq
    private constructor() {
        // 初始化数据库连接池
        this.pool = new Pool({
            user: 'uat',
            host: 'localhost',
            database: 'qq',
            password: '1qaz@WSX',
            port: 5432,
            max: 5, // 最大连接数
            idleTimeoutMillis: 30000, // 空闲连接超时30秒
            connectionTimeoutMillis: 2000, // 连接超时2秒
        });

        this.pool.on('error', (err) => {
            console.error('数据库连接池发生错误:', err);
        });
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async execute(sql: string, values: any[]) {
        try {
            const client = await this.pool.connect(); // 获取连接
            try {
                const res = await client.query(sql, values);
                return res;
            } finally {
                client.release(); // 释放连接回池
            }
        } catch (err) {
            console.error('sql执行失败:', err);
        }
    }


    // 存储消息
    public async saveMessage(userId: number, message: string): Promise<void> {
        const query = `
            INSERT INTO messages (user_id, message, timestamp)
            VALUES ($1, $2, NOW())
        `;
        const values = [userId, message];
        try {
            const client = await this.pool.connect(); // 获取连接
            try {
                await client.query(query, values);
                console.log('消息已存储:', message);
            } finally {
                client.release(); // 释放连接回池
            }
        } catch (err) {
            console.error('消息存储失败:', err);
        }
    }

    // 关闭连接池
    public async closePool(): Promise<void> {
        try {
            await this.pool.end();
            console.log('数据库连接池已关闭');
        } catch (err) {
            console.error('关闭连接池失败:', err);
        }
    }
}
