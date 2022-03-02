const express = require('express');
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { errorLog, consoleLog } = require("../helper/consoleLog");
const { encrypt, decrypt } = require('../helper/crypto');
const urlencodeParser = bodyParser.urlencoded({ extended: false });
const AuthController = require('../controllers/admin/AuthController');
const User = require("../models/User");

module.exports = function (app) {

	const baseUrl = process.env.BASE_URL || "/"; // Default

	app.all('/', (req, res, next) => {
		if (req.session.user) {
			if (req.session.user.position_id == 1) {
				return res.redirect(baseUrl + 'admin/');
			} else if (req.session.user.position_id == 2) {
				return res.redirect(baseUrl + 'opt/');
			} else {
				return res.redirect(baseUrl + '');
			}
		} else {
			res.redirect(baseUrl + 'login');
		}
	});

	app.use(function (req, res, next) { //auth middleware
		res.locals.APP_URL = process.env.APP_URL + req.baseUrl;
		next();
	})

	app.get(baseUrl + 'register', function (req, res) {
		if (req.user) { res.redirect('Dashboard/index'); }
		else {
			res.render('Auth/auth-register', { 'message': req.flash('success'), 'error': req.flash('error') });
		}
	});

	app.post(baseUrl + 'post-register', urlencodeParser, function (req, res) {
		let tempUser = { username: req.body.username, email: req.body.email, password: req.body.password };
		users.push(tempUser);

		// Assign value in session
		sess = req.session;
		sess.user = tempUser;

		res.redirect(baseUrl + '');
	});

	app.get(baseUrl + 'login', function (req, res) {
		res.locals.title = 'Login';
		if (req.session.user) {
			if (req.session.user.position_id == 1) {
				return res.redirect(baseUrl + 'admin/');
			} else if (req.session.user.position_id == 2) {
				return res.redirect(baseUrl + 'opt/');
			} else {
				return res.redirect(baseUrl + '');
			}
		} else {
			return res.render('Auth/auth-login', { 'message': req.flash('success'), 'error': req.flash('error') });
		}
	});

	app.post(baseUrl + 'post-login', urlencodeParser, async function (req, res) {

		const email = req.body.email;
		const password = req.body.password;

		let userData = await User.findOne({ email: email }).select("+password");
		if (userData && userData.password && (userData.position_id == 1 || userData.position_id == 2)) {

			const isMatch = await bcrypt.compare(password, userData.password);
			if (isMatch) {
				// Assign value in session
				req.session.user = userData;

				if (req.session.user.position_id == 1) {
					console.log('is admin');
					res.redirect(baseUrl + 'admin/');
				} else if (req.session.user.position_id == 2) {
					console.log('is operation team');
					res.redirect(baseUrl + 'opt/');
				} else {
					res.redirect(baseUrl + '');
				}
			}else{
				req.flash('error', 'Incorrect password!');
				res.redirect(baseUrl + 'login');
			}
		} else {
			req.flash('error', 'Incorrect email or password!');
			res.redirect(baseUrl + 'login');
		}
	});

	app.get(baseUrl + 'forgot-password', function (req, res) {
		res.render('Auth/auth-forgot-password', { 'message': req.flash('success'), 'error': req.flash('error') });
	});

	app.post(baseUrl + 'post-forgot-password', urlencodeParser, async function (req, res) {
		try {
			const email = req.body.email;
			const userData = await User.findOne({ email: email });

			if (userData) {
				// send mail for resting password	
				const transporter = nodemailer.createTransport({
					host: process.env.MAIL_HOST,
					port: process.env.MAIL_PORT,
					secure: false,
					requireTLS: true,
					auth: {
						user: process.env.MAIL_USERNAME,
						pass: process.env.MAIL_PASSWORD
					}
				});
				const encryptedId = encrypt(""+userData._id+"");
				const emailVerifyUrl = req.protocol + '://' + req.get('host') + '/reset-password/'+ encryptedId.key + '/' + encryptedId.id;
				consoleLog(__filename, req.originalUrl, emailVerifyUrl);

				const mailOptions = {
					from: process.env.MAIL_FROM_ADDRESS,
					to: userData.email,
					subject: 'Reset Your Password',
					text: '<html><body><a href="'+ emailVerifyUrl +'"><button>Reset Password</button></a></body></html>'
				};
				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						return console.log('Email sent error: ' + error);
					} else {
						return console.log('Email sent: ' + info.response);
					}
					transporter.close();
				});
				await User.findByIdAndUpdate(userData._id, {reset_password_status: 1}, {new : true, runValidators: true} );
				// return res.send(response.success(200, 'Email Send Successfully', [] ));
				req.flash('success', 'We have e-mailed your password reset link!');
				res.redirect(baseUrl + 'forgot-password');
			} else {
				req.flash('error', 'Email Not Found!!');
				res.redirect(baseUrl + 'forgot-password');
			}
		} catch (error) {
			console.log(error);
			req.flash('error', 'Something want wrong!!');
			res.redirect(baseUrl + 'forgot-password');
		}
	});

	app.get(baseUrl + 'logout', function (req, res) {
		// Assign null value in session
		req.session.user = null;
		res.redirect(baseUrl + 'login');
	});

	app.get("/reset-password/:key/:id", AuthController.resetPasswordWeb); // Reset Password web page
	app.post("/reset-password/:key/:id", urlencodeParser, AuthController.resetPassword); // Reset Password
	app.get("/reset-password-success/", AuthController.resetPasswordSuccess); // success message
};