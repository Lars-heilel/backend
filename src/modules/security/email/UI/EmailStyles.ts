export const EmailStyles = {
    // Общие стили
    container:
        'max-width: 600px; margin: 20px auto; padding: 30px; background-color: #f8f9fa; border-radius: 10px; font-family: Arial, sans-serif;',

    // Стили для письма сброса пароля
    resetPassword: {
        header: 'color: #2c3e50; text-align: center; margin-bottom: 25px; font-size: 24px; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;',
        button: 'background-color: #e74c3c;',
    },

    // Стили для письма подтверждения email
    confirmEmail: {
        header: 'color: #2c3e50; text-align: center; margin-bottom: 25px; font-size: 24px; border-bottom: 2px solid #3498db; padding-bottom: 10px;',
        button: 'background-color: #3498db;',
    },

    // Общие стили для контента
    contentBox:
        'padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
    mainText: 'color: #34495e; line-height: 1.6; margin-bottom: 20px;',
    buttonContainer: 'text-align: center; margin: 25px 0;',
    buttonBase:
        'display: inline-block; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.3s;',
    expirationText: 'color: #7f8c8d; font-size: 14px; text-align: center; margin-top: 25px;',
    expirationHighlight: 'color: #e74c3c; font-weight: bold;',
    footerText: 'color: #95a5a6; font-size: 12px; text-align: center; margin-top: 30px;',
};
