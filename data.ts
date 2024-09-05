import { Client } from 'pg';

export class DatabaseService {
    private static instance: DatabaseService;
    private dbClient: Client;

    //psql -h localhost -p 5432 -U uat -d qq
    constructor() {
        // 初始化数据库连接
        this.dbClient = new Client({
            user: 'uat',
            host: 'localhost',
            database: 'qq',
            password: '1qaz@WSX',
            port: 5432,
        });
        this.dbClient.connect().catch(err => console.error('数据库连接失败:', err));
    }
    
    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async saveMessage(userId: number, message: string) {
        const query = `
            INSERT INTO messages (user_id, message, timestamp)
            VALUES ($1, $2, NOW())
        `;
        const values = [userId, message];
        try {
            await this.dbClient.query(query, values);
            console.log('消息已存储:', message);
        } catch (err) {
            console.error('消息存储失败:', err);
        }
    }
}