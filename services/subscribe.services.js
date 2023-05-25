const db = require('../db')
const ApiError = require('../exceptions/api.error');

class SubscribeServices {
    async getSubscribes() {
        const subscribes = await db.query(`SELECT * FROM subscribe ORDER BY id`);
        return subscribes.rows;
    }

    async getOneSubscribe(id) {
        if (!id) {
            throw ApiError.BadRequest('Id don`t found');
        }
        const subscribe = await db.query(`SELECT * FROM subscribe WHERE id = ${id}`);
        return subscribe.rows[0];
    }

    async updateSubscribe(subscribe) {
        const { id, timeofactionday } = subscribe;
        if (!id) {
            throw ApiError.BadRequest("Id don`t found");
        }
        const updateSubscribe = await db.query(
            `UPDATE subscribe set timeofactionday = ${timeofactionday} WHERE id = ${id} RETURNING *`
        );
        return updateSubscribe.rows[0];
    }
}

module.exports = new SubscribeServices();