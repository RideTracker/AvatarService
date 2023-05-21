import getToken from "../controllers/tokens/getToken";

export async function withAuth(request: Request, env: Env, context: any) {
    const authorization = request.headers.get("Authorization")?.split(' ');

    if(!authorization)
        return Response.json({ success: false }, { status: 400, statusText: "Bad Request" });

    if(authorization[0] !== "Bearer" || authorization.length !== 2)
       return Response.json({ success: false }, { status: 400, statusText: "Bad Request" });

    const token = await getToken(env.SERVICE_DATABASE, authorization[1]);

    if(!token)
        return Response.json({ success: false }, { status: 401, statusText: "Unauthorized" });

    request.token = token;
};
