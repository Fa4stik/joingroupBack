const uuid = require('uuid');
const path = require('path');
const ApiError = require('../exceptions/api.error');

class FileServices {
    async saveFile(file) {
        try {
            const fileName = uuid.v4() + ".jpg";
            const filePath = path.resolve('Avatar', fileName);
            file.mv(filePath);
            return `http://localhost:5000/Avatar/${fileName}`; // edit!!!
        } catch (e) {
            throw ApiError.BadRequest(e.message)
        }
    }
}

module.exports = new FileServices();