export const $endpoints = {
  email: { resetPassword: '/aboba', confirmEmail: '/checkYourEmail' },
} as const;

export function $getFrontUrl(endpoints: string) {
  return `${process.env.CLIENT_URL}${endpoints}`;
}
