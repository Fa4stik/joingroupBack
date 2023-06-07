require('dotenv').config();
const express = require('express');
const subscribeRouter = require('./routes/subscribe.routes');
const userRouter = require('./routes/user.routes');
const logRouter = require('./routes/log.routes');
const authRouter = require('./routes/auth.routes');
const vkRouter = require('./routes/vk.routes');
const tgRouter = require('./routes/tg.routes');
const instaRouter = require('./routes/insta.routes');
const msgRouter = require('./routes/messengers.routes');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error.middleware');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(fileUpload({}))
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use(cookieParser());
app.use('/Avatar', express.static('Avatar'));
app.use('/tgPhoto', express.static('tgPhoto'));
app.use('/igPhoto', express.static('igPhoto'));
app.use('/api', subscribeRouter);
app.use('/api', userRouter);
app.use('/api', logRouter);
app.use('/api', authRouter);
app.use('/api/vk', vkRouter);
app.use('/api/tg', tgRouter);
app.use('/api/ig', instaRouter);
app.use('/api/msg', msgRouter);
app.use(errorMiddleware);

async function startApp() {
    try {
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

startApp();