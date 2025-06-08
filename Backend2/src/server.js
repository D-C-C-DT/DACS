require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload')
const connection = require('./config/database')
const app = express();
const port = process.env.PORT || 8888;
var cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const apiUser = require('./routes/api/user.api');
const apiCourse = require('./routes/api/course.api');
const apiChapter = require('./routes/api/chapter.api');
const apiTest = require('./routes/api/test.api');
const apiLesson = require('./routes/api/lesson.api');
const apiQuestion = require('./routes/api/question.api');
const apiAnswer = require('./routes/api/answer.api');
const apiReview = require('./routes/api/review.api');
const apiOrder = require('./routes/api/order.api');
const apiProgress = require('./routes/api/progress.api');
const apiTokenPackage = require('./routes/api/tokenPackage.api');
const apiRecharge = require('./routes/api/recharge.api');
const endpoint = require('./routes/endpoint');
const paymentRoutes = require('./routes/payment.route');
const { handleCallback } = require('./payment/momo.payment');
const { handleCallbackRecharge } = require('./payment/momo.recharge');

const configViewEngine = require('./config/viewEngine');
app.use(fileUpload());
configViewEngine(app)
//config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.use('/api/auth', authRoutes);
app.use('/v1/api/', apiUser);
app.use('/v1/api/', apiCourse);
app.use('/v1/api/', apiChapter);
app.use('/v1/api/', apiTest);
app.use('/v1/api/', apiLesson);
app.use('/v1/api/', apiQuestion);
app.use('/v1/api/', apiAnswer);
app.use('/v1/api/', apiReview);
app.use('/v1/api/', apiOrder);
app.use('/v1/api/', apiProgress);
app.use('/v1/api/', apiTokenPackage);
app.use('/v1/api/', apiRecharge);
app.use('/v1/api/', endpoint);

// Đăng ký router cho payment
app.use('/api/payment', paymentRoutes);

// Callback handler cho MoMo
app.post('/callback', handleCallback);
app.post('/callback/recharge', handleCallbackRecharge);

(async () => {
    try {
        await connection();
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })
    } catch (error) {
        console.log(">>> Error connect to DB:", error)
    }
})()