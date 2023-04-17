import fs from "fs";
import { v4 as uuidv4 } from "uuid";

async function getDirectUploadUrl(name) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`, {
        method: "POST",
        
        headers: {
            "Authorization": `Bearer ${process.env.CLOUDFLARE_API_IMAGES_TOKEN}`
        }
    });

    const content = await response.json();

    if(!content.success) {
        console.error(content);

        throw new Error("Failed to get direct upload url", content);
    }

    return {
        id: content.result.id,
        url: content.result.uploadURL
    };
};

async function uploadImage(name, path, url) {
    const mimeType = "image/png";
    
    const buffer = fs.readFileSync(path);
    const uint8Array = new Uint8Array(buffer);
    const blob = new Blob([ uint8Array ], { type: mimeType });

    const body = new FormData();

    body.append("file", blob, name);

    const response = await fetch(url, {
        method: "POST",
        body
    });

    const content = await response.json();

    if(!content.success) {
        console.error(content);

        throw new Error("Failed upload image");
    }
};

async function upload() {
    const directories = fs.readdirSync("./assets");

    for(let directory of directories) {
        const avatars = fs.readdirSync(`./assets/${directory}/`);

        for(let avatar of avatars) {
            const images = fs.readdirSync(`./assets/${directory}/${avatar}/`).filter((image) => {
                return image.endsWith(".png") && !image.endsWith("Preview.png");
            });

            const avatarId = uuidv4();

            {
                const { id, url } = await getDirectUploadUrl(avatar);
        
                await uploadImage(`${avatar} Preview.png`, `./assets/${directory}/${avatar}/${avatar} Preview.png`, url);
        
                console.log(`INSERT INTO avatars (id, name, type, image, timestamp) VALUES ("${avatarId}", "${avatar}", "unknown", "${id}", "${Date.now()}");`);
            }

            for(let image of images) {
                const { id, url } = await getDirectUploadUrl(avatar);

                await uploadImage(image, `./assets/${directory}/${avatar}/${image}`, url);
        
                console.log(`INSERT INTO avatar_images (id, avatar, type, image, layer, color_index, default_color, timestamp) VALUES ("${uuidv4()}", "${avatarId}", "unknown", "${id}", "${image.replace(avatar + " ", "").replace(".png", "")}", NULL, NULL, "${Date.now()}");`);
            }

            console.log(" ");
        }
    }
};

upload();
