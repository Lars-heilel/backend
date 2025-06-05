export type documentOptions = {
    operations: {
        summary?: string;
        description?: string;
        deprecated?: boolean;
    };

    responses: Array<{
        status: number;
        description: string;
        type?: any;
        isArray?: boolean;
        content?: any;
    }>;
    params?: Array<{
        name: string;
        description?: string;
        required?: boolean;
        type?: any;
        enum?: any;
    }>;
    query?: Array<{
        name: string;
        description?: string;
        required?: boolean;
        type?: any;
        isArray?: boolean;
        enum?: any;
    }>;
    body?: Array<{
        description?: string;
        required?: boolean;
        type?: any;
        examples?: any;
    }>;
    bearerAuth?: boolean;
};
