import { Avatar } from "../../models/Avatar";
import { UserAvatar } from "../../models/UserAvatar";

export async function getUserAvatars(database: D1Database, user: string): Promise<UserAvatar[] | null> {
    return (await database.prepare("SELECT * FROM user_avatars WHERE user = ?").bind(user).all<UserAvatar>()).results ?? null;
};
