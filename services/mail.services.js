const nodemailer = require('nodemailer');

class MailServices {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация почты',
            test: '',
            html:
                `
                    <div>
                        <h1>Для активации перейдите по ссылке:</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
        });
    }

    async resetPassword(to, login, password) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Сброс пароля',
            test: '',
            html:
                `
                    <div>
                        <h1>Ваш пароль успешно сброшен. Для авторизации используйте следующие данные:</h1>
                        <p>Логин: ${login}</p>
                        <p>Пароль: ${password}</p>
                    </div>
                `
        });
    }
}

module.exports = new MailServices();