import fs from "fs";

async function getDirectUploadUrl() {
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

async function createAvatar(name, type, image) {
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

    return result.avatar.id;
};

async function createAvatarColor(avatar, type, index, defaultColor) {
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

async function createAvatarImage(avatar, image, layer, colorIndex) {
    const url = new URL(`/api/avatars/${avatar}/image`, process.env.SERVICE_API_BASE);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.SERVICE_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ image, index, colorIndex })
    })

    const result = await response.json();

    if(!result.success)
        console.error("Failed to create avatar image", result);

    return result.id;
};

async function upload() {
    const directories = fs.readdirSync("./assets");

    for(let directory of directories) {
        const names = fs.readdirSync(`./assets/${directory}/`);

        for(let name of names) {
            const previewImage = await getDirectUploadUrl();
            const manifest = JSON.parse(fs.readFileSync(`./assets/${directory}/${name}/${name}.json`));

            const id = await createAvatar(name, manifest.type, previewImage.id)

            await uploadImage(`${name} Preview.png`, `./assets/${directory}/${name}/${name} Preview.png`, previewImage.url);

            if(manifest.colors) {
                for(let index = 0; index < manifest.colors.length; index++) {
                    await createAvatarColor(id, manifest.colors[index].type, index + 1, manifest.colors[index].defaultColor);
                }
            }

            const images = fs.readdirSync(`./assets/${directory}/${name}/`).filter((image) => {
                return image.endsWith(".png") && !image.endsWith("Preview.png");
            });

            {
                for(let image of images) {
                    const imageUpload = await getDirectUploadUrl();
                    
                    const layer = parseInt(image.replace(avatar + " Layer ", "").replace(".png", ""));

                    const layerSettings = manifest.layers.find((layer) => layer.index === layer);

                    await createAvatarImage(id, imageUpload.id, layer, layerSettings?.colorIndex);

                    await uploadImage(image, `./assets/${directory}/${avatar}/${image}`, imageUpload.url);
                }
            }

            console.log(`${name}: ${id}`);
            console.log(`${name}: ${manifest.colors.length} colors, ${images.length} images`);
            console.log(" ");
        }
    }
};

upload();
