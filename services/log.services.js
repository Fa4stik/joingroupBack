const db = require('../db');
const ApiError = require('../exceptions/api.error');

class LogServices {
    async createAction(log) {
        const {idUser, type, timeAction} = log;
        if (!idUser || !type || !timeAction) {
            throw ApiError.BadRequest('File don`t found')
        }
        const newLog = await db.query(`INSERT INTO log (iduser, type, timeaction)
                                VALUES ($1, $2, $3) RETURNING *`,
                                [idUser, type, timeAction]);
        return newLog.rows[0];
    }
}

module.exports = new LogServices();