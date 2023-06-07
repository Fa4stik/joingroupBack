const db =require('../db');
const fileServices = require('./file.services');
const ApiError = require('../exceptions/api.error');
const bcrypt = require("bcrypt");

class UserServices {
    async getUsers() {
        const users = await db.query('SELECT * FROM userj')
        return users.rows;
    }

    async getUserById(user) {
        const {id} = user;
        const getUser = await db.query(`SELECT * FROM userj WHERE id = ${id}`)
        if (getUser.rows.length === 0) {
            throw ApiError.BadRequest('Id user don`t found')
        }
        return getUser.rows[0];
    }

    async createUser(user) {
        const {
            name,
            lastname,
            email,
            password,
            activationlink
        } = user;
        const avatar = process.env.API_URL + '/Avatar/default.png';
        const { tokenvk, tokentg, tokeninst } = ''
        const idsubscribe = 1;
        const isactivated = false;
        const date = new Date();
        const timesrtartsubscribe = date.toISOString().split('T')[0];
        const newUser = await db.query(`INSERT INTO userj 
                                            (name, lastname, email, password, avatar, tokenvk, tokentg, tokeninst, idsubscribe, timesrtartsubscribe, isactivated, activationlink)
                                            VALUES
                                            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [name, lastname, email, password, avatar, tokenvk, tokentg, tokeninst, idsubscribe, timesrtartsubscribe, isactivated, activationlink]);
        return newUser.rows[0];
    }

    async updateUser(user, picture) {
        const {id, ...fieldsToUpdate} = user;
        const oldUser = (await db.query(`SELECT * FROM userj WHERE id = $1`, [id])).rows[0];

        // Prepare the SQL query
        const updates = [];
        const values = [];
        let valueIndex = 2; // Start from 2 because $1 is reserved for id
        for (let field in fieldsToUpdate) {
            if (field === 'password') {
                const hashPassword = await bcrypt.hash(fieldsToUpdate[field], 3);
                updates.push(`${field} = $${valueIndex}`);
                values.push(hashPassword);
                valueIndex++;
                continue;
            }
            if (field === 'avatar') {
                continue;
            }
            if (oldUser.hasOwnProperty(field)) {
                updates.push(`${field} = $${valueIndex}`);
                values.push(fieldsToUpdate[field]);
                valueIndex++;
            }
        }

        if (picture) {
            const avatar = await fileServices.saveFile(picture);
            updates.push(`avatar = $${valueIndex}`);
            values.push(avatar);
            valueIndex++;
        }

        const query = `
        UPDATE userj
        SET ${updates.join(", ")}
        WHERE id = $1
        RETURNING *`;

        // Execute the query
        const updateUser = await db.query(query, [id, ...values]);
        return updateUser.rows[0];
    }

    async deletedUser(user) {
        const { id } = user;
        const getUser = await db.query(`SELECT * FROM userj WHERE id = $1`, [id])
        if (getUser.rows.length === 0) {
            throw ApiError.BadRequest('Id user don`t found')
        }
        await db.query(`DELETE FROM userj WHERE id = $1`, [id]);
    }
}

module.exports = new UserServices();