import { EmailStyles } from './EmailStyles';
export const EmailTemplate = {
  confirmEmail: (url: string) => `
            <div style="${EmailStyles.container}">
                <h2 style="${EmailStyles.confirmEmail.header}">
                    Подтвердите ваш email
                </h2>
                
                <div style="${EmailStyles.contentBox}">
                    <p style="${EmailStyles.mainText}">
                        Для завершения регистрации перейдите по ссылке:
                    </p>
                    
                    <div style="${EmailStyles.buttonContainer}">
                        <a href="${url}" 
                           style="${EmailStyles.buttonBase} ${EmailStyles.confirmEmail.button}">
                            Подтвердить Email
                        </a>
                    </div>
            
                    <p style="${EmailStyles.expirationText}">
                        Ссылка действительна в течение 
                        <span style="${EmailStyles.expirationHighlight}">1 часа</span>
                    </p>
                </div>
                
                <p style="${EmailStyles.footerText}">
                    Если вы не регистрировались на нашем сайте, проигнорируйте это письмо.
                </p>
            </div>
        `,
  resetPasswordEmail: (url: string) => `
                <div style="${EmailStyles.container}">
                    <h2 style="${EmailStyles.resetPassword.header}">
                        Сброс пароля
                    </h2>
                    
                    <div style="${EmailStyles.contentBox}">
                        <p style="${EmailStyles.mainText}">
                            Для сброса пароля перейдите по ссылке:
                        </p>
                        
                        <div style="${EmailStyles.buttonContainer}">
                            <a href="${url}" 
                               style="${EmailStyles.buttonBase} ${EmailStyles.resetPassword.button}">
                                Сбросить пароль
                            </a>
                        </div>
            
                        <p style="${EmailStyles.expirationText}">
                            Ссылка действительна в течение 
                            <span style="${EmailStyles.expirationHighlight}">15 минут</span>
                        </p>
                    </div>
                    
                    <p style="${EmailStyles.footerText}">
                        Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
                    </p>
                </div>
            `,
};
