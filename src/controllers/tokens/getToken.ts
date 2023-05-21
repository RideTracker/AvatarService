import { Token } from "../../models/Token";

export default async function getToken(database: D1Database, token: string): Promise<Token> {
    return await database.prepare("SELECT * FROM tokens WHERE token = ?").bind(token).first();
};
