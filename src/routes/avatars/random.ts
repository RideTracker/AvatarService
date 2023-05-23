import puppeteer from "@cloudflare/puppeteer";
import renderAvatar from "../../controllers/avatars/renderAvatar";
import { AvatarLayer } from "../../models/AvatarLayers";
import { getAvatarImagesByAvatar } from "../../controllers/avatars/images/getAvatarImagesByAvatar";
import { getAvatarColorByAvatar } from "../../controllers/avatars/colors/getAvatarColorByAvatar";
import { getAvatars } from "../../controllers/avatars/getAvatars";

export async function handleRandomAvatarRequest(request: Request, env: Env) {
    const avatars = await getAvatars(env.DATABASE);

    if(!avatars)
        return Response.json({ success: false });

    const heads = avatars.filter((avatar) => avatar.type === "head");
    const jerseys = avatars.filter((avatar) => avatar.type === "jersey");
    const helmets = avatars.filter((avatar) => avatar.type === "helmet");
    const sunglasses = avatars.filter((avatar) => avatar.type === "sunglass");
    const wallpapers = avatars.filter((avatar) => avatar.type === "wallpaper");

    const combination = [
        {
            id: heads[Math.floor(Math.random() * heads.length)].id
        },

        {
            id: jerseys[Math.floor(Math.random() * jerseys.length)].id
        }
    ];

    const helmetIndex = Math.floor(Math.random() * (helmets.length + 1));

    if(helmetIndex !== helmets.length)
        combination.push(helmets[helmetIndex]);

    const sunglassIndex = Math.floor(Math.random() * (sunglasses.length + 1));

    if(sunglassIndex !== sunglasses.length)
        combination.push(sunglasses[sunglassIndex]);

    const wallpaperIndex = Math.floor(Math.random() * (wallpapers.length + 1));

    if(wallpaperIndex !== wallpapers.length)
        combination.unshift(wallpapers[wallpaperIndex]);

    return Response.json({
        combination,
        success: true
    });
};
