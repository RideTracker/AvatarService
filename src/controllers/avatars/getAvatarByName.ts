import { Avatar } from "../../models/Avatar";

export async function getAvatarByName(database: D1Database, name: string): Promise<Avatar | null> {
    return await database.prepare("SELECT * FROM avatars WHERE name = ?").bind(name).first<Avatar>();
};
