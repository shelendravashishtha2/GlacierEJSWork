const express = require('express');
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { encrypt, decrypt } = require('../../helper/crypto');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const User = require("../../models/User");

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
		res.locals.success_msg = req.flash('success_msg');
		res.locals.error_msg = req.flash('error_msg');
		next();
	})

	app.get(baseUrl + 'register', function (req, res) {
		if (req.user) { res.redirect(req.baseUrl+'Dashboard/index'); }
		else {
			res.render('Auth/auth-register', {layout: false, 'success': req.flash('success_msg'), 'error': req.flash('error_msg') });
		}
	});

	app.post(baseUrl + 'post-register', urlencodedParser, function (req, res) {
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
			return res.render('Auth/auth-login', {layout: false, 'success': req.flash('success_msg'), 'error': req.flash('error_msg') });
		}
	});

	app.post(baseUrl + 'post-login', urlencodedParser, async function (req, res) {

		const email = req.body.email;
		const password = req.body.password;

		let userData = await User.findOne({ email: email }).select("+password");
		if (userData && userData.password && (userData.position_id == 1 || userData.position_id == 2)) {

			const isMatch = await bcrypt.compare(password, userData.password);
			if (isMatch) {
				// Assign value in session
				req.session.user = userData;

				if (req.session.user.position_id == 1) {
					// console.log('is admin');
					res.redirect(baseUrl + 'admin/');
				} else if (req.session.user.position_id == 2) {
					// console.log('is operation team');
					res.redirect(baseUrl + 'opt/');
				} else {
					res.redirect(baseUrl + '');
				}
			}else{
				req.flash('error_msg', 'Incorrect password!');
				res.redirect(baseUrl + 'login');
			}
		} else {
			req.flash('error_msg', 'Incorrect email or password!');
			res.redirect(baseUrl + 'login');
		}
	});

	app.get(baseUrl + 'forgot-password', function (req, res) {
		res.render('Auth/auth-forgot-password', {layout: false, 'success': req.flash('success_msg'), 'error': req.flash('error_msg') });
	});

	app.post(baseUrl + 'post-forgot-password', urlencodedParser, async function (req, res) {
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
				consoleLog(emailVerifyUrl, __filename, req.originalUrl);

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
				req.flash('success_msg', 'We have e-mailed your password reset link!');
				res.redirect(baseUrl + 'forgot-password');
			} else {
				req.flash('error_msg', 'Email Not Found!!');
				res.redirect(baseUrl + 'forgot-password');
			}
		} catch (error) {
			req.flash('error_msg', 'Something want wrong!!');
			res.redirect(baseUrl + 'forgot-password');
		}
	});

	app.get(baseUrl + 'logout', function (req, res) {
		// Assign null value in session
		req.session.user = null;
		res.redirect(baseUrl + 'login');
	});

	// Reset Password web page
	app.get("/reset-password/:key/:id", async function (req, res) {
		res.locals.title = 'Reset Password';
		res.locals.session = req.session;

		const _id = decrypt(req.params.key, req.params.id);
		const userData = await User.findOne({ _id: _id });
		
		if (userData && userData.reset_password_status == 1) {
			return res.render('Auth/resetPassword', {layout: false, key: req.params.key, id: req.params.id });
		} else {
			return res.render('Pages/pages-404',{layout: false, code: 400, errorMessage: 'Data Not found'});
		}
	});

	// Reset Password
	app.post("/reset-password/:key/:id", urlencodedParser, async function (req, res) {
		try {
			if (req.body.password !== req.body.confirm_password) {
				return res.render('auth/resetPassword', {layout: false, key: req.params.key, id: req.params.id, error: "password are not match" })
			}
			const _id = decrypt(req.params.key, req.params.id);
			const userData = await User.findOne({ _id: _id });
			if (userData && userData.reset_password_status == 1) {
				await User.findByIdAndUpdate(_id, {password: req.body.password, reset_password_status: 0}, {new : true, runValidators: true} );
				return res.redirect('/reset-password-success');
			} else {
				return res.render('Pages/pages-404',{layout: false, code: 404, errorMessage: 'Data Not found'})
			}
		} catch (error) {
			if (error.name == "ValidationError") {
				const errorMessage = error.errors[Object.keys(error.errors)[0]];
				return res.render('auth/resetPassword', {layout: false, key: req.params.key, id: req.params.id, error: errorMessage.message })
			} else {
				errorLog(error, __filename, req.originalUrl);
				return res.render('Pages/pages-404',{layout: false, code: 500, errorMessage: 'Something want wrong. Please try again.'})
			}
		}
	});

	// success message
	app.get("/reset-password-success/", async function (req, res) {
		return res.render('auth/resetPasswordSuccess', {layout: false});
	});
};