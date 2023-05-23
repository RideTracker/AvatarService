import { AvatarColor } from "../../../models/AvatarColor";

export async function getAvatarColorByAvatar(database: D1Database, avatarId: string): Promise<AvatarColor[] | null> {
    return (await database.prepare("SELECT default_color AS defaultColor, avatar_colors.* FROM avatar_colors WHERE avatar = ?").bind(avatarId).all<AvatarColor>()).results ?? null;
};
