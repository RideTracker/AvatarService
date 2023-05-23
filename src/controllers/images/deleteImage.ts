import { CloudflareImagesResponse } from "../../models/CloudflareImagesResponse";

export default async function deleteImage(env: Env, id: string): Promise<boolean> {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${id}`, {
        method: "DELETE",

        headers: {
            "Authorization": `Bearer ${env.CLOUDFLARE_API_IMAGES_TOKEN}`
        }
    });

    const content: CloudflareImagesResponse = await response.json();

    return content.success;
};
