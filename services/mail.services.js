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
            subject: 'Activation account on ',
            test: '',
            html:
                `
                    <div>
                        <h1>For activation go to link:</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
        });
    }
}

module.exports = new MailServices();