import { createAvatar } from "../../controllers/avatars/createAvatar";
import { deleteAvatarById } from "../../controllers/avatars/deleteAvatarById";
import { getAvatarByName } from "../../controllers/avatars/getAvatarByName";
import { getAvatarImagesByAvatar } from "../../controllers/avatars/images/getAvatarImagesByAvatar";
import createImageDirectUploadUrl from "../../controllers/images/createImageDirectUploadUrl";
import deleteImage from "../../controllers/images/deleteImage";

export async function handleCreateAvatarRequest(request: Request, env: Env) {
    const { name, type } = request.content;

    const existingAvatar = await getAvatarByName(env.DATABASE, name);
    
    if(existingAvatar) {
        const existingImages = await getAvatarImagesByAvatar(env.DATABASE, existingAvatar.id) ?? [];

        await Promise.all([
            deleteAvatarById(env.DATABASE, existingAvatar.id),
            deleteImage(env, existingAvatar.image)
        ].concat(existingImages.map((avatarImage) => {
            return deleteImage(env, avatarImage.image)
        })));
    }

    const id = existingAvatar?.id ?? crypto.randomUUID();

    const directUploadUrl = await createImageDirectUploadUrl(env, "Avatars_" + name);

    if(!directUploadUrl)
        return Response.json({ success: false });

    const avatar = await createAvatar(env.DATABASE, id, name, type, directUploadUrl.id, Date.now());

    if(!avatar)
        return Response.json({ success: false });

    return Response.json({
        success: true,

        avatar: {
            id: avatar.id,
            name: avatar.name,
            type: avatar.type,
            image: avatar.image
        },

        uploadUrl: directUploadUrl.url
    });
};
