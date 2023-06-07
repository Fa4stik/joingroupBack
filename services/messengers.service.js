const vkServices = require('./vk.services');
const tgServices = require('./tg.services');
const igServices = require('./insta.services');

class MessengersService {
    async getPosts(data) {
        const vkPosts = await vkServices.getPosts(data);
        const tgPosts = await tgServices.getPosts(data);
        const igPosts = await igServices.getPosts(data);

        let finalPosts = [];
        let idCounter = 1; // Counter for IDs

        function addOrUpdatePost(post, source) {
            if (!post.text) return;
            // Try to find an existing post with the same text
            let existingPost = finalPosts.find(p => p.text === post.text);

            if (existingPost) {
                // If a post with the same text exists, update it
                existingPost.date = existingPost.date < post.date ? existingPost.date : post.date;
                existingPost.likeCount += post.likeCount;
                existingPost.commentCount += post.commentCount ? post.commentCount : 0;
                existingPost.viewsCount += post.viewsCount ? post.viewsCount : 0;
                existingPost.images = existingPost.images ? existingPost.images : post.images;
                existingPost[source] = true;
            } else {
                // Otherwise, create a new post
                finalPosts.push({
                    id: idCounter++,
                    owner_first: post.owner_first || 'AnoNim',
                    owner_last: post.owner_last || '',
                    text: post.text,
                    date: post.date,
                    likeCount: post.likeCount,
                    commentCount: post.commentCount || 0,
                    repostCount: post.repostCount || 0,
                    viewsCount: post.viewsCount || 0,
                    vk: source === 'vk',
                    tg: source === 'tg',
                    ig: source === 'ig',
                    images: post.images
                });
            }
        }

        // Process all posts
        for (let post of vkPosts) {
            addOrUpdatePost(post, 'vk');
        }
        for (let post of tgPosts) {
            addOrUpdatePost(post, 'tg');
        }
        for (let post of igPosts) {
            addOrUpdatePost(post, 'ig');
        }

        return finalPosts.sort((a, b) => Number(b.date) - Number(a.date));
    }

    async getGroupInfo(data) {
        const vkGroupInfo = await vkServices.getFullGroupInfo(data);
        const tgGroupInfo = await tgServices.getMemberCount(data);
        const igGroupInfo = await igServices.getGroupInfo(data);

        let finalInfoGroup = {
            name: vkGroupInfo.name ?  vkGroupInfo.name : tgGroupInfo.name,
            avatar: vkGroupInfo?.avatar,
            cover: vkGroupInfo?.cover,
            description: vkGroupInfo?.description,
            site: vkGroupInfo?.site,
            address: vkGroupInfo.address ? vkGroupInfo.address : null,
            membersCount: vkGroupInfo.membersCount + tgGroupInfo.membersCount + igGroupInfo.membersCount,
            storiesCount: vkGroupInfo.storiesCount + igGroupInfo.storiesCount,
            videoCount: vkGroupInfo.videoCount
        }

        return finalInfoGroup;
    }

    async createPost(picture, data) {
        const vkPost = await vkServices.createPost(picture, data);
        const tgPost = await tgServices.createPost(picture, data);
        const igPost = await igServices.createPost(picture, data);

        return {
            vkPost,
            tgPost,
            igPost,
        }
    }

    async setGroupInfo(cover, avatar, data) {
        const vkGroupInfo = await vkServices.setGroupInfo(cover, avatar, data);
        const tgGroupInfo = await tgServices.setBiography(avatar, data);
        const igGroupInfo = await igServices.setBiography(avatar, data);

        return {
            vkGroupInfo,
            tgGroupInfo,
            igGroupInfo
        }
    }

    async analysisPosts(data) {
        const posts = await this.getPosts(data);
        const oneWeekAgo = Math.floor((Date.now() / 1000) - (7 * 24 * 60 * 60)); // 7 days in seconds
        const oneMonthAgo = Math.floor((Date.now() / 1000) - (30 * 24 * 60 * 60)); // 30 days in seconds

        let lastWeekPosts = posts.filter(post => post.date >= oneWeekAgo);
        let lastMonthPosts = posts.filter(post => post.date >= oneMonthAgo);

        const addNewFields = (post) => {
            const postDate = new Date(post.date * 1000);
            const dateISO = postDate.toLocaleDateString('ru-RU');
            const nameFullDay = postDate.toLocaleDateString('ru-RU', {weekday: 'long'});
            const nameBriefDay = postDate.toLocaleDateString('ru-RU', {weekday: 'short'});

            return {
                ...post,
                dateISO,
                nameFullDay,
                nameBriefDay
            };
        };

        lastMonthPosts = lastMonthPosts.map(post => {
            return addNewFields(post);
        });

        lastWeekPosts = lastWeekPosts.map(post => {
            return addNewFields(post);
        })

        const groupByDate = (posts) => {
            const groups = {};
            for (let post of posts) {
                if (!groups[post.dateISO]) {
                    groups[post.dateISO] = {
                        likeCount: 0,
                        commentCount: 0,
                        repostCount: 0,
                        viewsCount: 0,
                        postsCount: 0,
                        dateISO: post.dateISO,
                        nameFullDay: post.nameFullDay,
                        nameBriefDay: post.nameBriefDay
                    };
                }
                groups[post.dateISO].likeCount += post.likeCount || 0;
                groups[post.dateISO].commentCount += post.commentCount || 0;
                groups[post.dateISO].repostCount += post.repostCount || 0;
                groups[post.dateISO].viewsCount += post.viewsCount || 0;
                groups[post.dateISO].postsCount += 1;
            }
            return groups;
        };

        const fillEmptyDates = (postsGroupedByDate, days) => {
            const result = [];
            const today = new Date();
            for (let i = 0; i < days; i++) {
                const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
                const dateISO = date.toLocaleDateString('ru-RU');
                const nameFullDay = date.toLocaleDateString('ru-RU', {weekday: 'long'});
                const nameBriefDay = date.toLocaleDateString('ru-RU', {weekday: 'short'});
                const postGroupForDate = postsGroupedByDate[dateISO];
                if (postGroupForDate) {
                    result.push(postGroupForDate);
                } else {
                    result.push({
                        dateISO,
                        nameFullDay,
                        nameBriefDay,
                        likeCount: 0,
                        commentCount: 0,
                        repostCount: 0,
                        viewsCount: 0,
                        postsCount: 0,
                    });
                }
            }
            return result;
        };

        const weekAnalysis = fillEmptyDates(groupByDate(lastWeekPosts), 7);
        const monthAnalysis = fillEmptyDates(groupByDate(lastMonthPosts), 30);

        return {
            weekAnalysis,
            monthAnalysis
        };
    }
}

module.exports = new MessengersService();