import puppeteer from "@cloudflare/puppeteer";
import renderAvatar from "../../controllers/avatars/renderAvatar";
import { AvatarLayer } from "../../models/AvatarLayers";
import { getAvatarImagesByAvatar } from "../../controllers/avatars/images/getAvatarImagesByAvatar";
import { getAvatarColorByAvatar } from "../../controllers/avatars/colors/getAvatarColorByAvatar";

export const renderAvatarSchema = {
    content: {
        avatars: {
            type: "array",
            required: true,

            schema: {
                id: {
                    type: "string",
                    required: true
                },

                colors: {
                    type: "array",
                    required: false,

                    schema: {
                        type: {
                            type: "string",
                            required: true
                        },

                        color: {
                            type: "string",
                            required: true
                        }
                    }
                }
            }
        }
    }  
};

export async function handleRenderAvatarRequest(request: Request, env: Env) {
    const { avatars } = request.content;

    const layers: AvatarLayer[] = (await Promise.all(avatars.map((avatar: any) => {
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

    const browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();
    
    await page.setContent("", {
        waitUntil: "domcontentloaded"
    });

    /*const layers: AvatarLayer[] = [
        {
            image: "https://staging.avatar-service.ridetracker.app/cdn-cgi/imagedelivery/iF-n-0zUOubWqw15Yx-oAg/8ba72c54-32fd-44fb-16df-40c86d7a4900/AvatarImage",
            color: "orange"
        },

        {
            image: "https://staging.avatar-service.ridetracker.app/cdn-cgi/imagedelivery/iF-n-0zUOubWqw15Yx-oAg/8f501742-78ff-4431-6523-cc8da1385200/AvatarImage",
            color: "blue"
        }
    ];*/

    const result = await page.evaluate(renderAvatar, layers);
    
    await browser.close();

    return Response.json({
        result,
        success: true
    });
};
