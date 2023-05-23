import puppeteer from "@cloudflare/puppeteer";
import renderAvatar from "../../controllers/avatars/renderAvatar";
import { AvatarLayer } from "../../models/AvatarLayers";

export async function handleRenderAvatarRequest(request: Request, env: Env) {
    const browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();
    
    await page.setContent("", {
        waitUntil: "domcontentloaded"
    });

    const layers: AvatarLayer[] = [
        {
            image: "https://staging.avatar-service.ridetracker.app/cdn-cgi/imagedelivery/iF-n-0zUOubWqw15Yx-oAg/8ba72c54-32fd-44fb-16df-40c86d7a4900/AvatarImage",
            color: "orange"
        },

        {
            image: "https://staging.avatar-service.ridetracker.app/cdn-cgi/imagedelivery/iF-n-0zUOubWqw15Yx-oAg/8f501742-78ff-4431-6523-cc8da1385200/AvatarImage",
            color: "blue"
        }
    ];

    const result = await page.evaluate(renderAvatar, layers);

    return Response.json({
        result,
        success: true
    });
};
