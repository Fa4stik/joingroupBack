const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const fs = require('fs');

let client;

class TgServices {
    async getPosts(apiId, apiHash, channelUsername) {
        const client = await this.getClient(apiId, apiHash);
        const channel = await client.getEntity(channelUsername);
        const posts = await client.getMessages(channel.id, {
            limit: 100,
            reverse: false
        });

        for (const post of posts) {
            if (post.media && post.media.photo) {
                await this.downloadPhoto(client, post.media.photo);
            }
        }

        return posts; // this need return url photos
    }

    async downloadPhoto(client, media) {
        const file = await client.downloadMedia(media);
        fs.writeFile("tmp", "test", function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
        console.log("File has been downloaded to", file);
    }
}

module.exports = new TgServices();