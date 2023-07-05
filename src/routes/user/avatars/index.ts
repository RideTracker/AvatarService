import { getUserAvatars } from "../../../controllers/users/getUserAvatars";

export async function handleUserAvatarsRequest(request: RequestWithKey, env: Env) {
    const avatars = await getUserAvatars(env.DATABASE, request.key.user);

    if(!avatars)
        return Response.json({ success: false });

    return Response.json({
        success: true,

        avatars: avatars.map((avatar) => {
            return {
                id: avatar.id,
                combination: avatar.combination,
                timestamp: avatar.timestamp
            };
        })
    });
};
