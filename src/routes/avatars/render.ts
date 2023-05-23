import puppeteer from "@cloudflare/puppeteer";

declare const document: any;

export async function handleRenderAvatarRequest(request: Request, env: Env) {
    
    const browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();
    
    await page.setContent(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);

    let test = "hello";

    const result = await page.evaluate(() => {
        document.body.innerText = test;

        return document.body.innerHTML;
    });

    return Response.json({
        result,
        success: true
    });
};
