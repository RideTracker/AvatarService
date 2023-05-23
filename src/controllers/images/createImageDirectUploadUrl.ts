import { DirectUploadUrlResponse } from "../../models/DirectUploadUrlResponse";

export default async function createImageDirectUploadUrl(env: Env, id: string): Promise<{ id: string, url: string } | null> {
    const body = new FormData();

    body.append("id", `RideTracker_${id}`);

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`, {
        method: "POST",

        headers: {
            "Authorization": `Bearer ${env.CLOUDFLARE_API_IMAGES_TOKEN}`
        },

        body
    });

    const content: DirectUploadUrlResponse = await response.json();

    if(!content.success || !content.result.id || !content.result.uploadURL)
        return null;

    return {
        id: content.result.id,
        url: content.result.uploadURL
    };
};
