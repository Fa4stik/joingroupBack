const db = require('../db')
const userServices = require('./user.services');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailServices = require('./mail.services');
const tokenServices = require('./token.services');
const UserDto = require('../dtos/user.dto');
const ApiError = require('../exceptions/api.error');
const e = require("express");
const generatePassword = require('password-generator');

class AuthServices {
    async createUser(user) {
        const { email, password } = user;
        const checkUser = await db.query(`SELECT * FROM userj WHERE email = '${email}'`);
        if (checkUser.rows.length > 0) {
            throw ApiError.BadRequest(`Пользователь с такой почтой (${email}) существует`);
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationlink = uuid.v4();
        await mailServices.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationlink}`);
        const updateUser = {...user, password: hashPassword, activationlink};
        const createdUser = await userServices.createUser(updateUser)
        console.log(createdUser)

        const userDto = new UserDto(createdUser);
        const tokens = tokenServices.generateTokens({...userDto});
        await tokenServices.saveToken(createdUser.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async activate(activationLink) {
        const user = await db.query(`SELECT * FROM userj WHERE activationlink = $1`, [activationLink]);
        if (user.rows.length === 0) {
            throw ApiError.BadRequest('Ссылка не действительная')
        }
        const saveUser = await db.query(`UPDATE userj SET isactivated = true WHERE id = $1 RETURNING *`, [user.rows[0].id])
        return saveUser;
    }

    async login(user) {
        const { email, password } = user;
        const checkUser = await db.query(`SELECT * FROM userj WHERE email = $1`, [email]);
        if (checkUser.rows.length === 0) {
            console.log('email');
            throw ApiError.BadRequest('Неправильный логин / пароль');
        }

        const isPasswordEqual = await bcrypt.compare(password, checkUser.rows[0].password);
        if (!isPasswordEqual) {
            console.log('password')
            const hashPassword = await bcrypt.hash(password, 3);
            console.log(hashPassword)
            throw ApiError.BadRequest('Неправильный логин / пароль');
        }

        const userDto = new UserDto(checkUser.rows[0]);
        const tokens = tokenServices.generateTokens({...userDto});
        await tokenServices.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async logout(refreshToken) {
        await tokenServices.removeToken(refreshToken);
    }

    async resetPassword(data) {
        const {email} = data;

        const checkUser = await db.query(`SELECT * FROM userj WHERE email = '${email}'`);
        if (checkUser.rows.length === 0) {
            throw ApiError.BadRequest(`Пользователь с такой почтой (${email}) не существует`);
        }

        const maxLength = 18;
        const minLength = 12;
        const uppercaseMinCount = 3;
        const lowercaseMinCount = 3;
        const numberMinCount = 2;
        const specialMinCount = 2;
        const UPPERCASE_RE = /([A-Z])/g;
        const LOWERCASE_RE = /([a-z])/g;
        const NUMBER_RE = /([\d])/g;
        const SPECIAL_CHAR_RE = /([\?\-])/g;
        const NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

        function isStrongEnough(password) {
            const uc = password.match(UPPERCASE_RE);
            const lc = password.match(LOWERCASE_RE);
            const n = password.match(NUMBER_RE);
            const sc = password.match(SPECIAL_CHAR_RE);
            const nr = password.match(NON_REPEATING_CHAR_RE);
            return password.length >= minLength &&
                !nr &&
                uc && uc.length >= uppercaseMinCount &&
                lc && lc.length >= lowercaseMinCount &&
                n && n.length >= numberMinCount &&
                sc && sc.length >= specialMinCount;
        }

        function customPassword() {
            let password = "";
            const randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
            while (!isStrongEnough(password)) {
                password = generatePassword(randomLength, false, /[\w\d\?\-]/);
            }
            return password;
        }

        const password = customPassword();
        const hashPassword = await bcrypt.hash(password, 3);

        await db.query(`UPDATE userj SET password = $1 WHERE email = $2`, [hashPassword, email]);
        await mailServices.resetPassword(email, email, password);

        return 'Новый пароль отправлен на почту';
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenServices.validateRefreshToken(refreshToken);
        const tokenData = await tokenServices.findToken(refreshToken);
        if (!userData || tokenData.length === 0) {
            console.log(`${tokenData} | ${uuid.v1()}`);
            throw ApiError.UnauthorizedError();
        }
        const updateUser = await db.query(`SELECT * FROM userj WHERE id = $1`, [userData.id]);

        const userDto = new UserDto(updateUser.rows[0]);
        const tokens = tokenServices.generateTokens({...userDto});
        await tokenServices.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }
}

module.exports = new AuthServices();