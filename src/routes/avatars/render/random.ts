import { Buffer } from "node:buffer";
import puppeteer from "@cloudflare/puppeteer";
import renderAvatar from "../../../controllers/avatars/renderAvatar";
import { getAvatarImagesByAvatar } from "../../../controllers/avatars/images/getAvatarImagesByAvatar";
import { getAvatarColorByAvatar } from "../../../controllers/avatars/colors/getAvatarColorByAvatar";
import { getAvatars } from "../../../controllers/avatars/getAvatars";

export async function handleRenderRandomAvatarRequest(request: Request, env: Env) {
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
        combination.push({ id: helmets[helmetIndex].id });

    const sunglassIndex = Math.floor(Math.random() * (sunglasses.length + 1));

    if(sunglassIndex !== sunglasses.length)
        combination.push({ id: sunglasses[sunglassIndex].id });

    const wallpaperIndex = Math.floor(Math.random() * (wallpapers.length + 1));

    if(wallpaperIndex !== wallpapers.length)
        combination.unshift({ id: wallpapers[wallpaperIndex].id });
    
    const layers: any[] = (await Promise.all(combination.map((avatar: any) => {
        return new Promise(async (resolve) => {
            const images = await getAvatarImagesByAvatar(env.DATABASE, avatar.id);
            const colors = await getAvatarColorByAvatar(env.DATABASE, avatar.id);

            resolve(images?.map((image) => {
                const color = avatar.colors?.find((avatarColor: any) => avatarColor.type === image.colorType)?.color ?? colors?.find((avatarColor) => avatarColor.type === image.colorType)?.defaultColor;

                return {
                    image: `https://staging.avatar-service.ridetracker.app/cdn-cgi/imagedelivery/${env.CLOUDFLARE_ACCOUNT_ID}/${image.image}/AvatarImage`,
                    color
                };
            }));
        });
    }))).flat();

    const id = env.DURABLE_BROWSER.idFromName("browser");
    const durableObject = env.DURABLE_BROWSER.get(id);

    const response = await durableObject.fetch(request.url, {
        method: "POST",
        body: JSON.stringify(layers)
    });

    const result = await response.text();

    console.log(result);

    return new Response(Buffer.from(result.split(',')[1], "base64"), {
        headers: {
            "Content-Type": "image/png",
            "Content-Disposition": "attachment; filename='avatar.png'"
        }
    });
};
