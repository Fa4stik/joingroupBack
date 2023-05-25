module.exports = class UserDto {
    email;
    id;
    isactivated;

    constructor(module) {
        this.email = module.email;
        this.id = module.id;
        this.isactivated = module.isactivated;
    }
}