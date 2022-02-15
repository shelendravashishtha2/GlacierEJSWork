require('dotenv').config();
const express = require('express');
const app = express();
require('./config/dbConn');

const AuthController = require('./controllers/AuthController');
const { formCron, ppmCron } = require('./controllers/cronController');
const fileUpload = require('express-fileupload');
const path = require('path');
const response = require('./helper/response');
const { errorLog } = require('./helper/consoleLog');
const flash = require('connect-flash');
const session = require('express-session');
const i18n = require('i18n-express');
const toastr = require('express-toastr');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');

global.__basedir = __dirname;
global.__joiOptions = { errors: { wrap: { label: '' } } }; // remove double quotes in default massage field name

const port = process.env.PORT || 3000;

app.use(
    session({
        key: 'user_sid',
        secret: 'thisIsSecretKey1234567890',
        resave: false, //true
        saveUninitialized: true, //false
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 1, //1day
        },
    }),
);

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

app.locals.moment = require('moment'); // apply moment for global view page

AuthController(app); // for auth routes

//For set layouts of html view
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('./public'));

// Define All Routes
app.use('/api', require("./routes/api"));
app.use('/admin/api', require("./routes/admin_api"));
app.use("/", require("./routes/web"));

//cron schedule
cron.schedule('01 00 * * *', async () => { //will run every night at 12:01 AM
	await formCron();
	await ppmCron();
});
cron.schedule('*/10 * * * * *', async () => { //for testing
	// await formCron();
	// await ppmCron();
});

app.all('/api/*', (req, res) => {
    return res.send( response.error(404, 'API Request not found!', []), []);
});

app.listen(port, (error) => {
    if (error) {
        errorLog(__filename, '--', error);
        throw error;
    }
    console.log(`connection is setup at ${port}`);
});
