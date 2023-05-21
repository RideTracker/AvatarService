export async function getAvatarCountByName(database: D1Database, name: string): Promise<number> {
    return await database.prepare("SELECT COUNT(id) AS count FROM avatars WHERE name = ?").bind(name).first<number>("count");
};
