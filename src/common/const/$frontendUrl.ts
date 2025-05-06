export const $endpoints = {
    email: { resetPassword: '/aboba' },
};

export function $getFrontUrl(endpoints: string) {
    return `${process.env.CLIENT_URL}${endpoints}`;
}
