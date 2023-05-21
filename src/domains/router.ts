import { ThrowableRouter, withContent } from "itty-router-extras";
import { withAuth } from "../middlewares/auth";
import { handleAvatarsRequest } from "../routes/avatars";

export default function createRouter() {
    const router = ThrowableRouter();

    router.options("*", (request: any) => Response.json({ success: true }));

    router.get("/api/avatars", withAuth, withContent, handleAvatarsRequest);

    return router;
};
