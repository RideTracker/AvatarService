import { Token } from "c:/GitHub/RideTracker/AvatarService/src/models/Token";

declare global {
    interface Env {
        [key: string]: string | undefined;
        
        BROWSER: BrowserWorker;
        DATABASE: D1Database;
        SERVICE_DATABASE: D1Database;
        
        BUCKET: R2Bucket;
        
        ENVIRONMENT: "production" | "staging";
        CLOUDFLARE_ACCOUNT_ID: string;
        CLOUDFLARE_API_IMAGES_TOKEN: string;

        GOOGLE_MAPS_API_TOKEN: string;

        GITHUB_SHA: string | undefined;
    };

    interface Request {
        request: import("c:/GitHub/RideTracker/AvatarService/src/models/Token").Token;
        [key: string]: any | undefined;
        
        token: Token;
    };
};

export {};
