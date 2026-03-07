export type BasicUser = {
    id: string;
    email: string;
    username: string;
    image?: string | null;
    created: Date;
    updated: Date;
    status?: boolean; // Premium account status: true = premium, false/null = free
};
