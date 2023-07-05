import { ThrowableRouter, withContent, withParams } from "itty-router-extras";
import { withAuth } from "../middlewares/auth";
import { handleAvatarsRequest } from "../routes/avatars";
import { handleCreateAvatarRequest } from "../routes/avatars/create";
import { handleCreateAvatarColorRequest } from "../routes/avatars/colors/create";
import { handleCreateAvatarImageRequest } from "../routes/avatars/images/create";
import { handleRenderAvatarRequest } from "../routes/avatars/render";
import { handleRandomAvatarRequest } from "../routes/avatars/random";
import { handleRenderRandomAvatarRequest } from "../routes/avatars/render/random";
import { handleUserAvatarsRequest } from "../routes/user/avatars";
import { handleCreateUserAvatarsRequest } from "../routes/user/avatars/create";

export default function createRouter() {
    const router = ThrowableRouter();

    router.options("*", (request: any) => Response.json({ success: true }));

    router.get("/api/ping", withContent, async (request: Request, env: Env) => {
        return Response.json({
            success: true,
            ping: "pong"
        });
    });

    router.get("/api/avatars", withAuth, withContent, handleAvatarsRequest);
    router.post("/api/avatars", withAuth, withContent, handleCreateAvatarRequest);
    router.post("/api/avatars/render", withAuth, withContent, handleRenderAvatarRequest);
    router.get("/api/avatars/render/random", withAuth, withContent, handleRenderRandomAvatarRequest);
    router.get("/api/avatars/random", withAuth, handleRandomAvatarRequest);
    router.post("/api/avatars/:avatarId/color", withAuth, withParams, withContent, handleCreateAvatarColorRequest);
    router.post("/api/avatars/:avatarId/image", withAuth, withParams, withContent, handleCreateAvatarImageRequest);

    router.get("/api/user/avatars", withAuth, handleUserAvatarsRequest);
    router.post("/api/user/avatars/create", withAuth, withContent, handleCreateUserAvatarsRequest);

    return router;
};
