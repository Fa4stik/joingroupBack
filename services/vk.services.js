const { VK } = require('vk-io');

class VkServices {
    vk;
    constructor(user) {
        this.vk = new VK({
            token: user?.tokenvk,
        });
    }

    async createPost(post) {
        try {
            const { domain, message } = post
            const { id } = await this.fullGroupInfo(domain);
            const response = await this.vk.api.wall.post({
                owner_id: `-${id}`,
                message,
            });
            return response;
        } catch (e) {
            console.log(e)
        }
    }

    async getPosts(user) {
        try {
            const { domainvk } = user;
            const response = await this.vk.api.wall.get({
                domain: domainvk,
                extended: 1,
                fields: "first_name,last_name"
            })
            return response;
        } catch (e) {
            console.log(e);
        }
    }

    async getUserInfo(user) {
        try {
            const { userVkId } = user;
            const response = await this.vk.api.users.get({
                user_ids: userVkId
            });
            return response;
        } catch (e) {
            console.log(e);
        }
    }

    // async getPhotoInfo()

    async fullGroupInfo(domain) {
        try {
            const response = await this.vk.api.groups.getById({
                group_id: domain
            });
            return response[0];
        } catch (e) {

        }
    }
}

module.exports = VkServices;