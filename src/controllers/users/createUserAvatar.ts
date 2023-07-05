import { Avatar } from "../../models/Avatar";
import { UserAvatar } from "../../models/UserAvatar";

export async function createUserAvatar(database: D1Database, user: string, combination: string): Promise<UserAvatar> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    return await database.prepare("INSERT INTO user_avatars (id, user, combination, timestamp) VALUES (?, ?, ?, ?) RETURNING *").bind(id, user, combination, timestamp).first<UserAvatar>();
};
