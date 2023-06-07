const { IgApiClient } = require('instagram-private-api');
const fs = require('fs');
const ApiError = require('../exceptions/api.error');
const axios = require("axios");
const path = require('path');

function fakeSave(data, sessionPath) {
    fs.writeFileSync(sessionPath, JSON.stringify(data));
}

function fakeExists(sessionPath) {
    return fs.existsSync(sessionPath);
}

function fakeLoad(sessionPath) {
    return JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
}

class InstaServices {
    async downloadImage(imageUrl, imagePath) {
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }

    async getAuth(user) {
        const { loginig, passig } = user;
        const sessionPath = './insta_session/' + loginig + '.json';
        const ig = new IgApiClient();
        ig.state.generateDevice(loginig);
        ig.state.proxyUrl = process.env.IG_PROXY;
        if (fakeExists(sessionPath)) {
            try {
                await ig.state.deserialize(fakeLoad(sessionPath));
                await ig.user.searchExact(loginig);
            } catch (e) {
                await ig.account.login(loginig, passig);
                ig.request.end$.subscribe(async () => {
                    const serialized = await ig.state.serialize();
                    delete serialized.constants;
                    fakeSave(serialized, sessionPath);
                });
            }
        } else {
            await ig.account.login(loginig, passig);
            ig.request.end$.subscribe(async () => {
                const serialized = await ig.state.serialize();
                delete serialized.constants;
                fakeSave(serialized, sessionPath);
            });
        }
        return ig;
    }

    async getPosts(user) {
        const { loginig } = user;
        const ig = await this.getAuth(user);
        const auth = await ig.user.searchExact(loginig);
        const userFeed = ig.feed.user(auth.pk);
        const items = await userFeed.items();

        const dir = './igPhoto';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        let postsPromise = items.map(async (item) => {
            let imageUrl = item.image_versions2.candidates[0].url;
            const filePath = path.join(dir, `file_${item.id}.jpg`);

            if (!fs.existsSync(filePath)) {
                await this.downloadImage(imageUrl, filePath);
            }

            let post = {
                id: item.id,
                owner_first: auth.full_name,
                // date: (item.device_timestamp).substring(0, 10),
                date: Math.floor(item.device_timestamp/1000000),
                text: item.caption ? item.caption.text : '',
                likeCount: item.like_count,
                commentCount: item.comment_count,
                ig: true,
                images: process.env.API_URL + `/igPhoto/file_${item.id}.jpg` // this download photo and return local path
            };
            return post;
        });

        const posts = await Promise.all(postsPromise);

        return posts;
    }

    async getGroupInfo(user) {
        const { loginig } = user;
        const ig = await this.getAuth(user);
        const auth = await ig.user.searchExact(loginig);
        const followersFeed = ig.feed.accountFollowers(auth.pk);
        let followers = [];
        let items;
        do {
            items = await followersFeed.items();
            followers = followers.concat(items);
        } while(followersFeed.isMoreAvailable());
        const userStoriesFeed = ig.feed.userStory(auth.pk);
        const userStories = await userStoriesFeed.items();
        return {
            membersCount: followers.length,
            storiesCount: userStories.length
        }
    }

    async createPost(picture, user) {
        if (!picture) {
            throw ApiError.BadRequest('Добавьте изображение для публикации');
        }
        const { message } = user;
        const ig = await this.getAuth(user);
        const publishResult = await ig.publish.photo({
            file: picture.data,
            caption: message
        });
        return publishResult;
    }

    async setBiography(avatar, user) {
        const { description } = user;
        const ig = await this.getAuth(user);
        if (avatar) {
            try {
                await ig.account.changeProfilePicture(avatar.data);
            } catch (e) {
                throw ApiError.BadRequest('INSTA: Аватар не соответсвует размерам')
            }
        }

        if (!description) {
            return true;
        }

        const response = await ig.account.setBiography(description);
        return response;
    }
}

module.exports = new InstaServices();