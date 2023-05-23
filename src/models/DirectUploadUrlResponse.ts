export type DirectUploadUrlResponse = {
    result: {
        id?: string;
        uploadURL?: string;
    };

    errors: {
        code: number;
        message: string;
    }[];

    messages: {
        code: number;
        message: string;
    }[];

    success: boolean;
};
