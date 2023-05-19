var Jimp = require("jimp");

export default {
    async fetch(request, env, ctx) {
        const avatar = await Jimp.read("https://imagedelivery.net/iF-n-0zUOubWqw15Yx-oAg/6ad11bcb-b72f-4721-3247-4f4de4aa8f00/Avatar");

        avatar.resize(100, 100).greyscale();

        const buffer = avatar.getBufferAsync("image/png");

        return new Response(buffer, {
            headers: {
                "Content-Type": "image/png"
            }
        });
    }
};
