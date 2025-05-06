interface PasswordRegex {
    MIN_LENGTH: number;
    REGEX: RegExp;
    MESSAGE: string;
}
export const PasswordRegex: PasswordRegex = {
    MIN_LENGTH: 8,
    REGEX: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
    MESSAGE:
        'Требуется более сложный пароль состоящий из заглавных а так же строчных букв,специальных символов и цыфр',
};
