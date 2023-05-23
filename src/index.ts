import createRouter from "./domains/router";
import DurableBrowser from "./domains/browsers";

const router = createRouter();

export default {
    async fetch(request: any, env: any) {
        const response = await router.handle(request, env);
        
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

        return response;
    }
};

export { DurableBrowser };
