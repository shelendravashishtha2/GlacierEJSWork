require('dotenv').config();
const express = require('express');
const app = express();
require('./config/dbConn');
// import controller
var AuthController = require('./controllers/AuthController');
const { formCron, ppmCron } = require('./controllers/cronController');

const apiRouter = require('./routers/api');
const pageRouter = require('./routers/web');
const adminRouter = require('./routers/admin_api');
const fileUpload = require('express-fileupload');
const path = require('path');
const response = require('./helper/response');
const { errorLog } = require('./helper/consoleLog');
var flash = require('connect-flash');
var session = require('express-session');
var i18n = require('i18n-express');
var toastr = require('express-toastr');
var cookieParser = require('cookie-parser');
const cron = require('node-cron');
const moment = require('moment');

global.__basedir = __dirname;
global.__joiOptions = { errors: { wrap: { label: '' } } }; // remove double quotes in default massage field name

const port = process.env.PORT || 3000;

app.use(
    session({
        key: 'user_sid',
        secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767s4d5f4sd65f4s6d5',
        resave: false, //true
        saveUninitialized: true, //false
        cookie: {
            // Session expires after 1 min : 60000 of in activity.
            // expires: 14 * 24 * 3600000 //2 weeks
            // secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 1, //1day
        },
    }),
);

// app.use(cookieParser('nodedemo'));
app.use(cookieParser());
app.use(flash());
app.use(
    i18n({
        translationsPath: path.join(__dirname, 'i18n'), // <--- use here. Specify translations files path.
        siteLangs: ['es', 'en', 'de', 'ru', 'it'],
        textsVarName: 'translation',
    }),
);

app.use(toastr());

app.use(function (req, res, next) {
    res.locals.toasts = req.toastr.render();
    next();
});

app.get('/layouts/', function (req, res) {
    res.render('view');
});

// apply controller
AuthController(app);

// apply moment for global view page
app.locals.moment = require('moment');

//For set layouts of html view
var expressLayouts = require('express-ejs-layouts');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('./public'));

// Define All Route
pageRouter(app);
app.use('/api', apiRouter);
app.use('/admin/api', adminRouter);

//cron schedule
cron.schedule('01 00 * * *', async () => { //will run every day at 12:01 AM
	await formCron();
	await ppmCron();
});
cron.schedule('*/10 * * * * *', async () => { //for testing
	// await formCron();
	// await ppmCron();
});

app.all('/api/*', (req, res) => {
    return res.send(
        response.error(404, 'API Request not found!', []),
    );
});

app.listen(port, (error) => {
    if (error) {
        errorLog(__filename, '--', error);
        throw error;
    }
    console.log(`connection is setup at ${port}`);
});
