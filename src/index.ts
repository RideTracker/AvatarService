import createRouter from "./domains/router";
import DurableBrowser from "./domains/browsers";
import { FeatureFlags, VersionFeatureFlags } from "./models/FeatureFlags";
import getUserAgentGroups from "./controllers/getUserAgentGroups";
import { triggerAlarm } from "./controllers/alarms/triggerAlarm";

const router = createRouter();

async function getRequest(request: Request, env: Env, context: EventContext<Env, string, null>, featureFlags: VersionFeatureFlags) {
    const response: Response = await router.handle(request, env, context, featureFlags);

    if(!response) {
        return new Response(undefined, {
            status: 404,
            statusText: "File Not Found"
        })
    }

    return response;
}

export default {
    async fetch(request: Request, env: Env, context: EventContext<Env, string, null>) {
        try {
            const userAgent = getUserAgentGroups(request.headers.get("User-Agent"));

            if(!userAgent) {
                return new Response(undefined, {
                    status: 400,
                    statusText: "Bad Request"
                });
            }

            const featureFlags = await env.FEATURE_FLAGS.get<FeatureFlags | null>(`${userAgent.client}`, {
                cacheTtl: 300,
                type: "json"
            });

            const versionFeatureFlags = featureFlags?.versions[userAgent.version.toString()];

            if(!versionFeatureFlags) {
                context.waitUntil(triggerAlarm(env, "User Agent Alarm", `An unrecognized user agent was detected.\n \n\`\`\`\n${userAgent.client}-${userAgent.version.toString()}\n\`\`\`\`\`\`\n${JSON.stringify(featureFlags, null, 4)}\n\`\`\`\n${request.method} ${request.url}\nRemote Address: || ${request.headers.get("CF-Connecting-IP")} ||`));
                
                return new Response(undefined, {
                    status: 400,
                    statusText: "Bad Request"
                });
            }

            if(versionFeatureFlags.status === "UNSUPPORTED") {
                return new Response(undefined, {
                    status: 410,
                    statusText: "Gone"
                });
            }

            const response = await getRequest(request, env, context, versionFeatureFlags);

            if(response.status < 200 || response.status > 299) { 
                context.waitUntil(new Promise<void>(async (resolve) => {
                    await triggerAlarm(env, "Unsuccessful Status Code Alarm", `A response has returned an unsuccessfull status code.\n \n\`\`\`\n${response.status} ${response.statusText}\n\`\`\`${request.method} ${request.url}\nRemote Address: || ${request.headers.get("CF-Connecting-IP")} ||`);

                    resolve();
                }));
            }

            response.headers.set("Access-Control-Allow-Origin", "*");
            response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            
            return response;
        }
        catch(error: any) {
            if(error instanceof Error) {
                if(error.message.startsWith("D1_")) {
                    context.waitUntil(triggerAlarm(env, "D1 Error Alarm", `An error was thrown by D1 during execution.\n \n\`\`\`\n${error.message}\n\`\`\`\n${request.method} ${request.url}\nRemote Address: || ${request.headers.get("CF-Connecting-IP")} ||`));
                
                    return new Response(undefined, {
                        status: 502,
                        statusText: "Bad Gateway"
                    });
                }
            }

            context.waitUntil(triggerAlarm(env, "Uncaught Error Alarm", `An uncaught error was thrown during a response.\n \n\`\`\`\n${error}\n\`\`\`\n${request.method} ${request.url}\nRemote Address: || ${request.headers.get("CF-Connecting-IP")} ||`));
            
            return new Response(undefined, {
                status: 500,
                statusText: "Internal Server Error"
            });
        }
    }
};

export { DurableBrowser };
