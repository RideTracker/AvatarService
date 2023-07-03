import { AvatarImage } from "../../../models/AvatarImage";

export async function getAvatarImages(database: D1Database): Promise<AvatarImage[] | null> {
    return (await database.prepare(`SELECT color_type AS colorType, avatar_images.* FROM avatar_images ORDER BY "index" ASC`).all<AvatarImage>()).results ?? null;
};
