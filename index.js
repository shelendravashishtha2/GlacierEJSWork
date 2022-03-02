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
const session = require('express-session');
const flash = require('connect-flash');
const toastr = require('express-toastr');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const logger = require('morgan');
const methodOverride = require('method-override');
compress = require('compression');

global.__basedir = __dirname;
global.__joiOptions = { errors: { wrap: { label: '' } } }; // remove double quotes in default massage field name
global.moment = moment; // apply moment for global variable
app.locals.moment = moment; // apply moment for global ejs view page

const baseUrl = process.env.BASE_URL || "/"; // Default
const port = process.env.APP_PORT || 1000;

app.use(cookieParser());
app.use(session({
        // key: 'user_sid',
        // secret: 'thisIsSecretKey1234567890',
        // resave: false, //true
        // saveUninitialized: false, //false
        // cookie: {
        //     maxAge: 1000 * 60 * 60 * 24 * 1, //1day
        // },
		cookieName: 'session',
		secret: 'thisIsSecretKey1234567890',
		saveUninitialized: true,
		resave: true
    }),
);
app.use(flash());
app.use(toastr());

app.use(function (req, res, next) {
    res.locals.toasts = req.toastr.render();
    next();
});

app.get(baseUrl + '/layouts/', function (req, res) {
    res.render('view');
});

AuthController(app); // for auth routes

//For set layouts of html view
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compress());
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(baseUrl+'public', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use(lusca({
	// csrf: true,
	xframe: 'SAMEORIGIN',
	xssProtection: true
}));
app.use(methodOverride());
// app.use(logger('dev')); // URL log in console print

// Define All Routes
app.use(baseUrl + 'api', require("./routes/api"));
app.use(baseUrl + "admin", require("./routes/web_admin"));
app.use(baseUrl + "opt", require("./routes/web_opt"));

//cron schedule
cron.schedule('01 00 * * *', async () => { //will run every night at 12:01 AM
	await formCron();
	await ppmCron();
});
cron.schedule('*/10 * * * * *', async () => { //for testing
    // console.log('testing Cron Run');
	// await formCron();
	// await ppmCron();
});

app.all(baseUrl + 'api/*', (req, res) => {
    return res.send( response.error(404, 'API Request not found!', []), []);
});

app.use(errorHandler()); // Error Handler

app.listen(port, (error) => {
    if (error) {
        errorLog(__filename, '--', error);
        throw error;
    }
    console.log(`connection is setup at ${port}`);
});