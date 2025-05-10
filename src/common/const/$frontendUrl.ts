export const $endpoints = {
    email: {
        resetPassword: '/reset-password',
        confirmEmail: '/confirm-email',
    },
} as const;
export function $getFrontUrl(endpoints: string) {
    return `${process.env.CLIENT_URL}${endpoints}`;
}
