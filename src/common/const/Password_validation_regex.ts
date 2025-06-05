interface PasswordRegex {
    MIN_LENGTH: number;
    REGEX: RegExp;
    MESSAGE: string;
}
export const PasswordRegex: PasswordRegex = {
    MIN_LENGTH: 8,
    REGEX: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
    MESSAGE:
        'Password must contain uppercase letters, lowercase letters, digits, and special characters',
};
