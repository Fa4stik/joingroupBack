const jwt = require('jsonwebtoken');
const db = require('../db');

class TokenServices {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await db.query('SELECT * FROM tokens WHERE userid = $1', [userId])
        if (tokenData.rows.length > 0) {
            const oldTokenData = await db.query('UPDATE tokens SET refreshtoken = $1 WHERE userid = $2 RETURNING *', [refreshToken, userId])
            return oldTokenData.rows[0];
        }
        const newTokenData = await db.query('INSERT INTO tokens (userid, refreshtoken) VALUES ($1, $2) RETURNING *', [userId, refreshToken]);
        return newTokenData.rows[0];
    }

    async removeToken(refreshToken) {
        await db.query(`DELETE FROM tokens WHERE refreshtoken = $1`, [refreshToken])
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async findToken(refreshToken) {
        const token = await db.query(`SELECT * FROM tokens WHERE refreshtoken = $1`, [refreshToken]);
        return token.rows;
    }
}

module.exports = new TokenServices();