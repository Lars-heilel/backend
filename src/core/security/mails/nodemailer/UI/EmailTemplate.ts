import { EmailStyles } from './EmailStyles';

const emailWrapper = (content: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Email</title>
    </head>
    <body style="${EmailStyles.body}">
        <center class="wrapper" style="${EmailStyles.wrapper}">
            <table class="main" width="100%">
                <tr>
                    <td style="padding: 20px 0;">
                        ${content}
                    </td>
                </tr>
            </table>
        </center>
    </body>
    </html>
`;

export const EmailTemplate = {
    confirmEmail: (url: string) => {
        const content = `
            <div style="${EmailStyles.container}">
                <!-- Если у вас есть логотип, можно добавить его сюда -->
                <!-- <img src="YOUR_LOGO_URL" alt="Logo" style="${EmailStyles.logo}" /> -->

                <h2 style="${EmailStyles.confirmEmail.header}">
                    Confirm Your Email Address
                </h2>
                
                <div style="${EmailStyles.contentBox}">
                    <p style="${EmailStyles.mainText}">
                        To complete your registration, please click the button below to verify your email address.
                    </p>
                    
                    <div style="${EmailStyles.buttonContainer}">
                        <a href="${url}" 
                           target="_blank"
                           style="${EmailStyles.buttonBase} ${EmailStyles.confirmEmail.button}">
                            Confirm Email
                        </a>
                    </div>
            
                    <p style="${EmailStyles.expirationText}">
                        This link is valid for 
                        <span style="${EmailStyles.expirationHighlight}">1 hour</span>.
                    </p>
                </div>
                
                <p style="${EmailStyles.footerText}">
                    If you did not sign up for our service, please disregard this email.
                </p>
            </div>
        `;
        return emailWrapper(content);
    },
    resetPasswordEmail: (url: string) => {
        const content = `
            <div style="${EmailStyles.container}">
                <h2 style="${EmailStyles.resetPassword.header}">
                    Reset Your Password
                </h2>
                
                <div style="${EmailStyles.contentBox}">
                    <p style="${EmailStyles.mainText}">
                        To reset your password, please click the button below.
                    </p>
                    
                    <div style="${EmailStyles.buttonContainer}">
                        <a href="${url}"
                           target="_blank"
                           style="${EmailStyles.buttonBase} ${EmailStyles.resetPassword.button}">
                            Reset Password
                        </a>
                    </div>
            
                    <p style="${EmailStyles.expirationText}">
                        This link is valid for 
                        <span style="${EmailStyles.expirationHighlight}">15 minutes</span>.
                    </p>
                </div>
                
                <p style="${EmailStyles.footerText}">
                    If you did not request a password reset, please ignore this email.
                </p>
            </div>
        `;
        return emailWrapper(content);
    },
};
