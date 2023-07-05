import { createUserAvatar } from "../../../controllers/users/createUserAvatar";

export const createUserAvatarRequestSchema = {
    content: {
        combination: {
            type: "array",
            required: true,
            schema: {
                type: "object",
                required: true,
                schema: {
                    id: {
                        type: "string",
                        required: true
                    },

                    colors: {
                        type: "array",
                        required: true,
                        schema: {
                            type: "object",
                            schema: {
                                type: {
                                    type: "string",
                                    required: true
                                },

                                color: {
                                    type: "string",
                                    required: true
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export async function handleCreateUserAvatarsRequest(request: RequestWithKey, env: Env) {
    const { combination } = request.content;

    await createUserAvatar(env.DATABASE, request.key.user, JSON.stringify(combination));

    return Response.json({
        success: true
    });
};
