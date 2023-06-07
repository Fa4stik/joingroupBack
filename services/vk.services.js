const { VK, WallAttachment } = require('vk-io');
const ApiError = require("../exceptions/api.error");
const axios = require('axios');
const fs = require('fs');
const {_logFunc} = require("nodemailer/lib/shared");

class VkServices {
    async getAuth(user) {
        return new VK({
            token: user?.tokenvk,
        });
    }

    async getPosts(post) {
        const vk = await this.getAuth(post)
        const { domainvk } = post;
        const response = await vk.api.wall.get({
            domain: domainvk,
            extended: 1,
            fields: "first_name,last_name"
        })

        const profilesMap = new Map();
        await response.profiles.map(prf => {
            profilesMap.set(prf.id, prf)
        })

        let posts = response.items.map(item => {
            if (item.ads_easy_promote.text === ' Нельзя продвигать записи об обновлении фотографии профиля.') return null;

            let post = {
                id: item.id,
                owner_first: profilesMap.get(item.from_id).first_name,
                owner_last: profilesMap.get(item.from_id).last_name,
                text: item.text,
                date: item.date,
                likeCount: item.likes.count,
                commentCount: item.comments.count,
                repostCount: item.reposts.count,
                vk: true,
                images: null
            };

            if (item.attachments.length > 0) {
                item.attachments[0].photo?.sizes.map(media => {
                    if (media.type === 'z') {
                        post = {...post, images: media.url};
                    }
                })
            }
            return post;
        })

        return posts.filter(Boolean);
    }

    async getUserInfo(user) {
        const vk = await this.getAuth(post)
        const { userVkId } = user;
        const response = await vk.api.users.get({
            user_ids: userVkId
        });
        return response;
    }

    async getFullGroupInfo(user) {
        const vk = await this.getAuth(user)
        const { domainvk } = user;

        const members = await vk.api.groups.getMembers({
            group_id: domainvk
        });

        // cover.images[cover.images.length - 1].url

        const { id, name, photo_200, description, cover, site } = (await vk.api.groups.getById({
            group_id: domainvk,
            fields: 'description,cover,site'
        }))[0];

        const stories = await vk.api.stories.get({
            owner_id: `-${id}`
        })

        const video = await vk.api.video.get({
            owner_id: `-${id}`
        });

        const gAddress = await vk.api.groups.getAddresses({
            group_id: id
        })

        const { address } = gAddress.items[0];

        return {
            name,
            avatar: photo_200,
            cover: cover.images[cover.images.length - 1].url,
            description,
            site,
            address,
            membersCount: members.count,
            storiesCount: stories.count,
            videoCount: video.count
        };
    }

    async createPost(picture, post) {
        const vk = await this.getAuth(post)
        const { domainvk, message } = post;
        const { id } = (await vk.api.groups.getById({ group_id: domainvk }))[0];

        let response;

        if (picture) {
            const attachments = await vk.upload.wallPhoto({
                source: {
                    value: picture.data
                },
                group_id: id
            });

            response = await vk.api.wall.post({
                owner_id: `-${id}`,
                message,
                attachments
            });
        } else {
            response = await vk.api.wall.post({
                owner_id: `-${id}`,
                message
            });
        }

        return response;
    }

    async setGroupInfo(cover, avatar, user) {
        const vk = await this.getAuth(user);
        const { domainvk, website, phone, city, description } = user;
        const { id } = (await vk.api.groups.getById({
            group_id: domainvk
        }))[0];

        const groupEditParams = {
            group_id: id
        }

        if (city) {
            const fullInfoCity = await vk.api.database.getCities({
                q: city
            })

            if (fullInfoCity.items.length === 0) {
                throw ApiError.BadRequest('Введённый город некорректный')
            }

            groupEditParams.city = fullInfoCity.items[0].id
        }

        if (website) {
            groupEditParams.website = website
        }

        if (phone) {
            groupEditParams.phone = phone
        }

        if (description) {
            groupEditParams.description = description;
        }

        if (cover) {
            try {
                await vk.upload.groupCover({
                    source: {
                        value: cover.data
                    },
                    group_id: id,
                    crop_x: 0,
                    crop_y: 0,
                    crop_x2: 1590,
                    crop_y2: 400
                })
            } catch (e) {
                throw ApiError.BadRequest('VK: Обложка не соответсвует размерам')
            }
        }

        if (avatar) {
            try {
                await vk.upload.ownerPhoto({
                    source: {
                        value: avatar.data
                    },
                    owner_id: -id,
                    crop_x: 0,
                    crop_y: 0,
                    crop_x2: 200,
                    crop_y2: 200
                })
            } catch (e) {
                throw ApiError.BadRequest('VK: Аватар не соответсвует размерам')
            }
        }

        const groupInfo = await vk.api.groups.edit(groupEditParams)
        return groupInfo;
    }
}

module.exports = new VkServices();