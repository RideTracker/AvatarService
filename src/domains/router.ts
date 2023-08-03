import { ThrowableRouter, withContent, withParams } from "itty-router-extras";
import { handleAvatarsRequest } from "../routes/avatars";
import { handleCreateAvatarRequest } from "../routes/avatars/create";
import { handleCreateAvatarColorRequest } from "../routes/avatars/colors/create";
import { handleCreateAvatarImageRequest } from "../routes/avatars/images/create";
import { handleRenderAvatarRequest } from "../routes/avatars/render";
import { handleRandomAvatarRequest } from "../routes/avatars/random";
import { handleRenderRandomAvatarRequest } from "../routes/avatars/render/random";
import { handleUserAvatarsRequest } from "../routes/user/avatars";
import { handleCreateUserAvatarsRequest } from "../routes/user/avatars/create";
import { withAuth } from "@ridetracker/authservice";

export default function createRouter() {
    const router = ThrowableRouter();

    router.options("*", (request: any) => Response.json({ success: true }));

    router.get("/api/ping", withContent, async (request: Request, env: Env) => {
        return Response.json({
            success: true,
            ping: "pong"
        });
    });

    router.get("/api/avatars", withAuth("user", "SERVICE_DATABASE"), withContent, handleAvatarsRequest);
    router.post("/api/avatars", withAuth("user", "SERVICE_DATABASE"), withContent, handleCreateAvatarRequest);
    router.post("/api/avatars/render", withAuth("service", "SERVICE_DATABASE"), withContent, handleRenderAvatarRequest);
    router.get("/api/avatars/render/random", withAuth("service", "SERVICE_DATABASE"), withContent, handleRenderRandomAvatarRequest);
    router.get("/api/avatars/random", withAuth("service", "SERVICE_DATABASE"), handleRandomAvatarRequest);
    router.post("/api/avatars/:avatarId/color", withAuth("user", "SERVICE_DATABASE"), withParams, withContent, handleCreateAvatarColorRequest);
    router.post("/api/avatars/:avatarId/image", withAuth("user", "SERVICE_DATABASE"), withParams, withContent, handleCreateAvatarImageRequest);

    router.get("/api/user/avatars", withAuth("user", "SERVICE_DATABASE"), handleUserAvatarsRequest);
    router.post("/api/user/avatars/create", withAuth("user", "SERVICE_DATABASE"), withContent, handleCreateUserAvatarsRequest);

    return router;
};
