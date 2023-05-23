import { getAvatarById } from "../../../controllers/avatars/getAvatarById";
import { createAvatarImage } from "../../../controllers/avatars/images/createAvatarImage";
import createImageDirectUploadUrl from "../../../controllers/images/createImageDirectUploadUrl";

export async function handleCreateAvatarImageRequest(request: Request, env: Env) {
    const { avatarId } = request.params;
    const { index, colorType } = request.content;

    const avatar = await getAvatarById(env.DATABASE, avatarId);

    if(!avatar)
        return Response.json({ success: false });

    const directUploadUrl = await createImageDirectUploadUrl(env, "Avatars_" + avatar.name + "_" + index);

    if(!directUploadUrl)
        return Response.json({ success: false });

    const avatarImage = await createAvatarImage(env.DATABASE, avatar.id, directUploadUrl.id, index, colorType ?? null);

    if(!avatarImage)
        return Response.json({ success: false });

    return Response.json({
        success: true,

        image: {
            id: avatarImage.id,
            image: avatarImage.image,
            index: avatarImage.index,
            colorType: avatarImage.colorType
        },

        uploadUrl: directUploadUrl.url
    });
};
