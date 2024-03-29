import { Avatar } from "../../models/Avatar";

export async function getAvatarById(database: D1Database, id: string): Promise<Avatar | null> {
    return await database.prepare("SELECT * FROM avatars WHERE id = ?").bind(id).first<Avatar>();
};
