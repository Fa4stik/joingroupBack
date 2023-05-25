const db = require('../db')
const userServices = require('./user.services');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailServices = require('./mail.services');
const tokenServices = require('./token.services');
const UserDto = require('../dtos/user.dto');
const ApiError = require('../exceptions/api.error');
const e = require("express");

class AuthServices {
    async createUser(user) {
        const { email, password } = user;
        const checkUser = await db.query(`SELECT * FROM userj WHERE email = '${email}'`);
        if (checkUser.rows.length > 0) {
            throw ApiError.BadRequest(`User with this email (${email}) exists`);
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
            throw ApiError.BadRequest('Link is not valid')
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