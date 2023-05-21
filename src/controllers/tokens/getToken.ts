import { Token } from "../../models/Token";

export default async function getToken(database: D1Database, key: string): Promise<Token> {
    return await database.prepare("SELECT * FROM tokens WHERE key = ?").bind(key).first();
};
