const { StringSession} = require("telegram/sessions");
const {TelegramClient} = require("telegram");
const input = require("input");
const ncp = require('node-clipboardy');
const os = require('os');
const fs = require('fs')
const path = require('path');
const pkg = require('../package.json');
const TelegramBot = require('node-telegram-bot-api');
const ApiError = require("../exceptions/api.error");

class TgServices {
    async getAuth() {
        const stringSession = new StringSession("");

        const client = new TelegramClient(stringSession, 26108024, process.env.API_HASH_TG, {
            deviceModel: `${pkg.name}@${os.hostname()}`,
            systemVersion: os.version() || 'Unknown',
            appVersion: pkg.version,
            useWSS: true, // not sure if it works in node at all
            testServers: false, // this one should be the default for node env, but who knows for sure :)
            connectionRetries: 5, // just doubled the value from an example
        });

        await client.start({
            phoneNumber: async () => await input.text("number ?"),
            password: async () => await input.text("password?"),
            phoneCode: async () => await input.text("Code ?"),
            onError: (err) => console.log(err),
        });

        const sess = client.session.save();
        await ncp.writeSync(sess);
        console.log(sess); // Save this string to avoid logging in again
    }

    async getMemberCount(group) {
        const { tokentg, domaintg } = group;
        const bot = new TelegramBot(tokentg);
        const chat = await bot.getChat(domaintg);
        const membersCount = await bot.getChatMemberCount(domaintg);
        return {
            name: chat.title,
            membersCount,
        };
    }

    async getPosts(user) {
        // await this.getAuth();
        const { domaintg } = user;
        const stringSession = new StringSession(process.env.SESSION_TG);
        const client = new TelegramClient(stringSession, 26108024, process.env.API_HASH_TG, {});
        await client.connect();
        const channel = await client.getEntity(domaintg);
        const items = await client.getMessages(channel.id, {
            limit: 100,
            reverse: false
        });

        const dir = './tgPhoto';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        const postsPromises = items.map(async (item) => {
            if (item.className !== 'Message') return null;
            const filePath = path.join(dir, `file_${item.id}.jpg`);
            let likeCount = 0;

            item.reactions?.results?.map((reac) => {
                likeCount+=reac.count;
            });

            let post = {
                id: item.id,
                text: item.message,
                date: item.date,
                likeCount,
                viewsCount: item.views,
                tg: true,
                images: null,
            };

            if (item.media && !fs.existsSync(filePath)) {
                const buffer = await client.downloadMedia(item.media, {
                    workers: 1,
                });
                post = {...post, images: filePath};
                fs.writeFileSync(filePath, buffer);
            }

            if (item.media && fs.existsSync(filePath)) {
                post = {...post, images: process.env.API_URL + `/tgPhoto/file_${item.id}.jpg`};
            }

            return post;
        })

        const posts = (await Promise.all(postsPromises)).filter(Boolean);
        await client.disconnect();
        return posts;
    }

    async createPost(picture, post) {
        const { tokentg, domaintg, message } = post;
        const bot = new TelegramBot(tokentg);
        let response = null;
        if (picture) {
            response = await bot.sendPhoto(domaintg, picture.data, {caption: message});
        } else {
            response = await bot.sendMessage(domaintg, message);
        }
        return response;
    }

    async setBiography(avatar, group) {
        const { tokentg, domaintg, description } = group;
        const bot = new TelegramBot(tokentg);

        if (avatar) {
            try {
                await bot.setChatPhoto(domaintg, avatar.data);
            } catch (e) {
                throw ApiError.BadRequest('TG: Аватар не соответсвует размерам')
            }
        }

        if (!description) {
            return true
        }

        // Fetch current chat description
        const chat = await bot.getChat(domaintg);
        const currentDescription = chat.description;

        // Only update description if it has changed
        if (currentDescription !== description) {
            const response = await bot.setChatDescription(domaintg, description);
            return response;
        }
        return false;
    }
}

module.exports = new TgServices();