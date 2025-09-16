export const $endpoints = {
    email: {
        resetPassword: '/reset-password',
        VERIFY_ACCOUNT: '/verify-account',
    },
} as const;
export function $getFrontUrl(endpoints: string) {
    return `${process.env.CLIENT_URL}${endpoints}`;
}
