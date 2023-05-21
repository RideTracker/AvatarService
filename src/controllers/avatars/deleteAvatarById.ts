export async function deleteAvatarById(database: D1Database, id: string): Promise<void> {
    await database.batch([
        database.prepare("DELETE FROM avatar_colors WHERE avatar = ?").bind(id),
        database.prepare("DELETE FROM avatar_images WHERE avatar = ?").bind(id),
        database.prepare("DELETE FROM avatars WHERE id = ?").bind(id)
    ]);
};
