import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs";

async function getDirectUploadUrl() {
    console.log("getDirectUploadUrl");

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

async function deleteImage(image) {
    console.log("deleteImage");

    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${image}`, {
            method: "DELETE",
            
            headers: {
                "Authorization": `Bearer ${process.env.CLOUDFLARE_API_IMAGES_TOKEN}`
            }
        });
    
        const content = await response.json();
    
        if(!content.success) {
            console.error(content);
    
            throw new Error("Failed to delete image", content);
        }
    }
    catch {
        console.warn("failed to delete image", image, "probably doesn't exist");
    }
};

async function uploadImage(name, path, url) {
    console.log("uploadImage");

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

async function createAvatar(name, type, image) {
    console.log("createAvatar");

    const url = new URL("/api/avatars", process.env.SERVICE_API_BASE);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.SERVICE_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, type, image })
    })

    const result = await response.json();

    if(!result.success)
        console.error("Failed to create avatar", result);

    return result;
};

async function createAvatarColor(avatar, type, index, defaultColor) {
    console.log("createAvatarColor");

    const url = new URL(`/api/avatars/${avatar}/color`, process.env.SERVICE_API_BASE);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.SERVICE_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ type, index, defaultColor })
    })

    const result = await response.json();

    if(!result.success)
        console.error("Failed to create avatar color", result, JSON.stringify({ type, index, defaultColor }));

    return result.id;
};

async function createAvatarImage(avatar, image, index, colorType) {
    console.log("createAvatarImage");

    const url = new URL(`/api/avatars/${avatar}/image`, process.env.SERVICE_API_BASE);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.SERVICE_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ image, index, colorType })
    })

    const result = await response.json();

    if(!result.success)
        console.error("Failed to create avatar image", result, JSON.stringify({ image, index, colorType }));

    return result;
};

async function upload(type, name) {
    const previewImage = await getDirectUploadUrl();
    const manifest = JSON.parse(fs.readFileSync(`./assets/${type}/${name}/${name}.json`));

    const avatarResult = await createAvatar(name, manifest.type, previewImage.id);

    if(avatarResult.existingAvatar) {
        await deleteImage(avatarResult.existingAvatar.image);
        
        for(let avatarImage of avatarResult.existingAvatar.images)
            await deleteImage(avatarImage.image);
    }
    
    const id = avatarResult.avatar.id;

    await uploadImage(`${name} Preview.png`, `./assets/${type}/${name}/${name} Preview.png`, previewImage.url);

    if(manifest.colors) {
        for(let index = 0; index < manifest.colors.length; index++) {
            await createAvatarColor(id, manifest.colors[index].type, index, manifest.colors[index].defaultColor);
        }
    }

    const images = fs.readdirSync(`./assets/${type}/${name}/`).filter((image) => {
        return image.endsWith(".png") && !image.endsWith("Preview.png");
    });

    {
        for(let image of images) {
            const imageUpload = await getDirectUploadUrl();
            
            const layer = parseInt(image.replace(name + " Layer ", "").replace(".png", ""));

            const layerSettings = manifest.layers.find((_layer) => _layer.index === layer);

            console.log("layer settings", layerSettings);

            await createAvatarImage(id, imageUpload.id, layer, layerSettings?.colorType ?? null);

            if(avatarResult.existingAvatar)
                await deleteImage(avatarResult.existingAvatar.image);

            await uploadImage(image, `./assets/${type}/${name}/${image}`, imageUpload.url);
        }
    }

    console.log(`${name}: ${id}`);
    console.log(`${name}: ${manifest.colors.length} colors, ${images.length} images`);
    console.log(" ");
};

async function uploadAll() {
    const directories = fs.readdirSync("./assets");

    for(let directory of directories) {
        const names = fs.readdirSync(`./assets/${directory}/`);

        for(let name of names) {
            await upload(directory, name);
        }
    }
};

if(!process.argv.length)
    throw new Error("missing arguments, enter --all or specify avatar by type:name, e.g. Heads:Female Head 1");

if(process.argv[0] === "--all")
    uploadAll();
else {
    for(let arg of process.argv) {
        const [ type, name ] = arg.split(':');
        
        upload(type, name);
    } 
}
