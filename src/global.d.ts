import { Token } from "@ridetracker/authservice";

declare global {
    interface Env {
        [key: string]: string | undefined;
        
        BROWSER: BrowserWorker;
        DURABLE_BROWSER: DurableObjectNamespace;
        
        DATABASE: D1Database;
        SERVICE_DATABASE: D1Database;
        
        BUCKET: R2Bucket;
        
        FEATURE_FLAGS: KVNamespace;
        
        ENVIRONMENT: "production" | "staging";
        CLOUDFLARE_ACCOUNT_ID: string;
        CLOUDFLARE_API_IMAGES_TOKEN: string;

        GOOGLE_MAPS_API_TOKEN: string;

        GITHUB_SHA: string | undefined;
        
        ANALYTICS_SERVICE: Fetcher;
        ANALYTICS_SERVICE_CLIENT_ID: string;
        ANALYTICS_SERVICE_CLIENT_TOKEN: string;
    };

    interface RequestWithKey extends Request {
        [key: string]: any;
        
        token: Required<Token>;
    };
};
