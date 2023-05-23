import puppeteer, { Browser } from "@cloudflare/puppeteer";
import renderAvatar from "../controllers/avatars/renderAvatar";

export default class DurableBrowser {
    private state: DurableObjectState;
    private storage: DurableObjectStorage;
    private env: Env;

    private browser: Browser | null = null;
    private keptAliveInSeconds: number = 0;

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.storage = this.state.storage;
        this.env = env;
    };

    async fetch(request: Request) {
        const layers = await request.json();

        if (!this.browser) {
            console.log("Durable Browser: starting new instance");
            
            try {
                this.browser = await puppeteer.launch(this.env.BROWSER);
            }
            catch (error) {
                console.log(`Durable Browser: could not start browser instance: ${error}`);
            }
        }

        this.keptAliveInSeconds = 0;

        const result = await this.performTask(layers) as string;

        this.keptAliveInSeconds = 0;

        const currentAlarm = await this.storage.getAlarm();

        if(!currentAlarm) {
            console.log("Durable Browser: setting alarm");

            this.storage.setAlarm(Date.now() + (10 * 1000));
        }

        return new Response(result, {
            headers: {
                "Content-Type": "text/plain"
            }
        });
    }

    async alarm() {
        this.keptAliveInSeconds += 10;

        if(this.keptAliveInSeconds < 60) {
            console.log(`Durable Browser: has been kept alive for ${this.keptAliveInSeconds} seconds. Extending lifespan.`);

            this.storage.setAlarm(Date.now() + (10 * 1000));
        }
        else
            console.log("Durable Browser: cxceeded life of 60. Will be shut down in 10 seconds.");
    }

    async performTask(layers: any) {
        if (!this.browser)
            return;

        console.log("Durable Browser: executing task");

        const page = await this.browser.newPage();

        await page.setContent("", {
            waitUntil: "domcontentloaded"
        });
    
        const result = (await page.evaluate(renderAvatar, layers)) as string;

        page.close();

        return result;
    }
};
