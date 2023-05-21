import { Avatar } from "../../models/Avatar";

export async function getAvatars(database: D1Database): Promise<Avatar[] | null> {
    return (await database.prepare("SELECT * FROM avatars").all<Avatar>()).results ?? null;
};
