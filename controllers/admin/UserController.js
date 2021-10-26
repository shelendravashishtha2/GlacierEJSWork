const User = require("../../models/User");
const fs = require('fs')
const path = require('path');
const bcrypt = require("bcryptjs");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {errorLog} = require("../../helper/consoleLog");
const UserResource = require('../resources/UserResource');
const Joi = require("joi");
const Property = require('../../models/Property');
const UserProperty = require('../../models/UserProperty');
const { check, sanitizeBody, validationResult, matchedData } = require('express-validator');

exports.changePasswordValidation = async (req, res, next) => {
	const schema = Joi.object({
		new_password: Joi.string().min(6).max(30).required(),
		old_password: Joi.string().min(6).max(30).required(),
	});
	const validation = schema.validate(req.body, __joiOptions);
	if (validation.error) {
		return res.send(response.error(400, validation.error.details[0].message, [] ));
	} else {
		next();
	}
}

// Supervisor add Form Validatation
exports.supervisorAddValidation = async (req, res, next) => {
	const schema = Joi.object({
		full_name: Joi.string().min(3).max(150).required(),
		email: Joi.string().min(6).max(100).required().email(),
		mobile_no: Joi.string().min(6).max(12).required(),
		password: Joi.string().min(6).max(30).required(),
	});
	const validation = schema.validate(req.body, __joiOptions);
	if (validation.error) {
		return res.send(response.error(400, validation.error.details[0].message, [] ));
	} else {
		next();
	}
}

// Supervisor add api 
exports.supervisorAdd = async (req, res) => {
	try {
		const existsUser = await User.findOne({ email: req.body.email });
		if(existsUser) {
			return res.send(response.error(400, 'email id already exists', [] ));
        }

        if (req.files) {
			let profile_image = req.files.profile_image;
			let uploadPath = __basedir + '/public/images/users/';
			let fileName;

			if (profile_image) {
				if (profile_image.mimetype !== "image/png" && profile_image.mimetype !== "image/jpg" && profile_image.mimetype !== "image/jpeg"){
					return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
				}
				if (profile_image.size >= (1024 * 1024 * 5)) { // if getter then 5MB
					return res.send(response.error(400, 'Image must be less then 5MB', []));
				}
				fileName = 'profile-image-' + Date.now() + path.extname(profile_image.name);
				profile_image.mv(uploadPath + fileName, function(err) {
					if (err){
						return res.send(response.error(400, 'Image uploading failed', []));
					}
				});
				req.body.profile_image = '/public/images/users/' + fileName;
			}
		}

		const registerUser = new User({
			full_name: req.body.full_name,
			email: req.body.email,
			mobile_no: req.body.mobile_no,
            password: req.body.password,
            profile_image:req.body.profile_image,
			position: 5, // supervisor type
		});
		const registeredData = await registerUser.save();
		const userDataJson = JSON.parse(JSON.stringify(registeredData));
		delete userDataJson.password;

		return res.send(response.success(200, 'Supervisor Added Success', UserResource(userDataJson)));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(400, errorMessage.message, [] ));
		} else {
			errorLog(__filename, req.originalUrl, error);
			return res.send(response.error(500, 'Something want wrong', [] ));
		}
	}
}

// User Create Page
exports.userCreate = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Create User', session:req.session};
		res.locals.error = req.session.error ? req.session.error : '';

		let UserData = await User.find({position: 5});
		let propertyData = await Property.find();

		return res.render('Admin/Users/create',{ data: UserResource(UserData), propertyData: propertyData });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// User create Form Validatation
exports.userAddValidation = [
	check('full_name').trim().notEmpty().withMessage('full name is required'),
	check('mobile_no').trim().notEmpty().withMessage('mobile no is required'),
	check('position_id').trim().notEmpty().withMessage('position is required'),
	check('property_id').trim().notEmpty().withMessage('property id is required'),
	check('address').trim().notEmpty().withMessage('address is required'),
	check('password').trim().notEmpty().withMessage('password is required'),
	check('email').trim().notEmpty().withMessage('email is required')
		.normalizeEmail().isEmail().withMessage('must be a valid email')
		.custom(value => {
			return User.findOne({email: value}).then((user) => { if (user) {return Promise.reject('E-mail already exists')} })
		}),
];

// create user 
exports.userAdd = async (req, res) => {
	try {
		const errors= validationResult(req);
        if(!errors.isEmpty()){
			let errMsg = errors.mapped();
			let inputData = matchedData(req);
			req.session.error = {errMsg: errMsg, inputData: inputData};
			return res.redirect('back');
        // } else if(req.body.email) {
		// 	const existsUser = await User.findOne({ email: req.body.email });
		// 	if(existsUser) {
		// 		let errMsg= errors.mapped();
		// 		let inputData = matchedData(req);
		// 		req.session.error = {errMsg: errMsg, inputData: inputData};
		// 		return res.redirect('back');
		// 	}
		} else {
			req.session.error = '';
		}

        if (req.files && req.files.profile_image) {
			let profile_image = req.files.profile_image;
			let uploadPath = __basedir + '/public/images/users/';
			let fileName;

			if (profile_image.mimetype !== "image/png" && profile_image.mimetype !== "image/jpg" && profile_image.mimetype !== "image/jpeg"){
				let errMsg = { profile_image: { msg: 'profile image File format should be PNG,JPG,JPEG' } };
				req.session.error = {errMsg: errMsg, inputData: req.body};
				return res.redirect('back');
			}
			if (profile_image.size >= (1024 * 1024 * 5)) { // if getter then 5MB
				let errMsg = { profile_image: { msg: 'profile image must be less then 5MB' } };
				req.session.error = {errMsg: errMsg, inputData: req.body};
				return res.redirect('back');
			}
			fileName = 'profile-image-' + Date.now() + path.extname(profile_image.name);
			profile_image.mv(uploadPath + fileName, function(err) {
				if (err){
					let errMsg = { profile_image: { msg: 'profile image uploading failed' } };
					req.session.error = {errMsg: errMsg, inputData: req.body};
					return res.redirect('back');
				}
			});
			req.body.profile_image = '/public/images/users/' + fileName;
		} else {
			let errMsg = { profile_image: { msg: 'profile image is required' } };
			req.session.error = {errMsg: errMsg, inputData: req.body};
			return res.redirect('back');
		}

		let positionType = '';
		if(req.body.position_id == 2){
			positionType = "Operation Team";
		}else if(req.body.position_id == 3){
			positionType = "Auditor";
		}else if(req.body.position_id == 4){
			positionType = "Manager";
		}else if(req.body.position_id == 5){
			positionType = "Supervisor";
		}else{
			positionType = "";
		}

		let registerUser = new User({
			full_name: req.body.full_name,
			email: req.body.email,
			mobile_no: req.body.mobile_no,
			address: req.body.address,
            password: req.body.password,
			profile_image: req.body.profile_image,
			property_id: req.body.property_id, // Property list
			position_id: req.body.position_id, // user type id
			position_type: positionType, // user type
		});
		await registerUser.save();

		req.body.property_id = Array.isArray(req.body.property_id) ? req.body.property_id : [req.body.property_id];
		for (let i = 0; i < req.body.property_id.length; i++) {
			const property_id = req.body.property_id[i];
			let UserPropertyData = new UserProperty({
				userId: registerUser._id,
				propertyId: property_id,
			});
			await UserPropertyData.save();
		}

		res.redirect('/users');
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(400, errorMessage.message, [] ));
		} else {
			errorLog(__filename, req.originalUrl, error);
			return res.send(response.error(500, 'Something want wrong', [] ));
		}
	}
}

// Users list
exports.pageNotFound = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Users', session:req.session};
		let UserData = await User.find({position: 5});
		return res.render('Pages/pages-404',{'data':UserResource(UserData)});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Supervisor list
exports.supervisorList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Users', session:req.session};
		let UserData = await User.find({position: 5});
		return res.render('Admin/Users/index',{'data':UserResource(UserData)});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Users list
exports.userList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Users', session: req.session};
		let UserData = await User.find();
		return res.render('Admin/Users/index',{'data':UserResource(UserData)});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// User edit Page
exports.userEdit = async (req,res) => {
	try {
		res.locals = { title: 'Update User', session: req.session };
		res.locals.error = req.session.error ? req.session.error : '';
		
		let UserData = await User.findOne({_id: req.params.id});
		let UserPropertyData = await UserProperty.find({userId: req.params.id});
		let propertyData = await Property.find();
		return res.render('Admin/Users/edit',{ data: UserResource(UserData), propertyData: propertyData, UserPropertyData: UserPropertyData });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.userUpdateValidation = [
	check('_id').trim().notEmpty().withMessage('User Id required'),
	check('full_name').trim().notEmpty().withMessage('full name is required'),
	check('email').trim().notEmpty().withMessage('email is required').normalizeEmail().isEmail().withMessage('must be a valid email'),
	check('mobile_no').trim().notEmpty().withMessage('mobile no is required'),
	check('position_id').trim().notEmpty().withMessage('position is required'),
	check('property_id').trim().notEmpty().withMessage('property id is required'),
	check('address').trim().notEmpty().withMessage('address is required'),
];

// User update
exports.userUpdate = async (req,res) => {
	try {
		res.locals = { title: 'Update User', session: req.session};
		req.body.property_id = Array.isArray(req.body.property_id) ? req.body.property_id : [req.body.property_id];

		let oldUserData = await User.findOne({_id: req.body._id});
		
		const errors= validationResult(req);
        if(!errors.isEmpty()){
			let errMsg= errors.mapped();
			let inputData = matchedData(req);
			req.session.error = {errMsg: errMsg, inputData: inputData};
			return res.redirect('back');
        } else if(oldUserData.email != req.body.email) {
			const existsUser = await User.findOne({ email: req.body.email });
			if(existsUser) {
				let errMsg= errors.mapped();
				let inputData = matchedData(req);
				req.session.error = {errMsg: errMsg, inputData: inputData};
				return res.redirect('back');
			}
		} else {
			req.session.error = '';
		}

        if (req.files) {
			let profile_image = req.files.profile_image;
			let uploadPath = __basedir + '/public/images/users/';
			let fileName;

			if (profile_image) {
				if (profile_image.mimetype !== "image/png" && profile_image.mimetype !== "image/jpg" && profile_image.mimetype !== "image/jpeg"){
					return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
				}
				if (profile_image.size >= (1024 * 1024 * 5)) { // if getter then 5MB
					return res.send(response.error(400, 'Image must be less then 5MB', []));
				}
				fileName = 'profile-image-' + Date.now() + path.extname(profile_image.name);
				profile_image.mv(uploadPath + fileName, function(err) {
					if (err){
						return res.send(response.error(400, 'Image uploading failed', []));
					}
				});
				req.body.profile_image = '/public/images/users/' + fileName;
			}
		}

		let positionType = '';
		if(req.body.position_id == 2){
			positionType = "Operation Team";
		}else if(req.body.position_id == 3){
			positionType = "Auditor";
		}else if(req.body.position_id == 4){
			positionType = "Manager";
		}else if(req.body.position_id == 5){
			positionType = "Supervisor";
		}else{
			positionType = "";
		}

		let UserData = await User.findOne({_id: req.body._id});
		UserData.full_name = req.body.full_name;
		UserData.email = req.body.email;
		UserData.mobile_no = req.body.mobile_no;
		UserData.address = req.body.address;
		UserData.position_id = req.body.position_id;
		UserData.position_type = positionType; // user type
		UserData.property_id = req.body.property_id;
		UserData.profile_image = req.body.profile_image;
		await UserData.save();

		let deleteOldUserProperty = await UserProperty.deleteMany({ userId: UserData._id });
		for (let i = 0; i < req.body.property_id.length; i++) {
			const property_id = req.body.property_id[i];
			let UserPropertyData = new UserProperty({
				userId: UserData._id,
				propertyId: property_id,
			});
			await UserPropertyData.save();
		}

		return res.redirect('/users');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// User View Page
exports.userView = async (req,res) => {
	try {
		res.locals = { title: 'View User', session: req.session};

		let UserData = await User.findOne({ _id: req.params.id, position: 5});
		let UserPropertyData = await UserProperty.find({ userId: req.params.id}).populate({path: 'propertyId'}).lean();

		return res.render('Admin/Users/view',{ data: UserResource(UserData), UserPropertyData: UserPropertyData });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.userProfile = async (req, res) => {
	try {
		let UserData = await User.findOne({_id: req.user._id});
		UserData = JSON.parse(JSON.stringify(UserData));
		return res.send(response.success(200, 'success', UserResource(UserData)));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.updateUser = async (req, res) => {0
	try {
		const validation = User.userValidate(req.body); //user data validation
		if (validation.error){ //if any error message
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		if (req.files) {
			let profile_image = req.files.profile_image;
			let uploadPath = __basedir + '/public/uploads/';
			let fileName;

			if (profile_image) {
				if (profile_image.mimetype !== "image/png" && profile_image.mimetype !== "image/jpg" && profile_image.mimetype !== "image/jpeg"){
					return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
				}
				if (profile_image.size >= (1024 * 1024 * 5)) { // if getter then 5MB
					return res.send(response.error(400, 'Image must be less then 5MB', []));
				}
				fileName = 'profile-image-' + Date.now() + path.extname(profile_image.name);
				profile_image.mv(uploadPath + fileName, function(err) {
					if (err){
						return res.send(response.error(400, 'Image uploading failed', []));
					}
				});
				req.body.profile_image = '/public/uploads/' + fileName;
			}
		}

		// remove null or blank value key remove
		Object.keys(req.body).forEach((key) => { if(req.body[key] == '' || req.body[key] == null || req.body[key] == 'undefined') delete req.body[key] });

		req.body.registration_status = 1;
		const updates = Object.keys(req.body);
		const allowedUpdates = ['name', 'birth_date', 'gender', 'interest', 'about', 'city', 'hometown', 'language', 'occupation', 'height', 'children', 'edu_qualification', 'relationship_status', 'smoking','profile_image','registration_status'];
		const isValidOperation = updates.every((update) =>  allowedUpdates.includes(update));
		if (!isValidOperation) {
			return res.send(response.error(400, 'Invalid update fields!', [] ));
		}
		const _id = req.user._id;

		let updateUser = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true} );
		updateUser = JSON.parse(JSON.stringify(updateUser));
        updateUser.token = req.user.token;
        
		return res.send(response.success(200, 'success', UserResource(updateUser)));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(400, errorMessage.message, []));
		} else {
			errorLog(__filename, req.originalUrl, error);
			return res.send(response.error(500, 'Something want wrong', []));
		}
	}
}

exports.profileImageUpload = async (req, res) => {
	try {
		if (req.files && req.files.profile_image) {
			let profile_image = req.files.profile_image;
			let uploadPath = __basedir + '/public/images/users/';

			const extensionName = path.extname(profile_image.name);
			const allowedExtension = ['.png','.jpg','.jpeg'];
			if(!allowedExtension.includes(extensionName)){
				return res.send(response.error(422, 'File format should be PNG,JPG,JPEG', []));
			}

			if (profile_image.mimetype !== "image/png" && profile_image.mimetype !== "image/jpg" && profile_image.mimetype !== "image/jpeg"){
				return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
			}
			if (profile_image.size >= (1024 * 1024 * 5)) { // if getter then 5MB
				return res.send(response.error(400, 'Image must be less then 5MB', []));
			}
			let fileName = 'profile-image-' + Date.now() + path.extname(profile_image.name);
			profile_image.mv(uploadPath + fileName, function(err) {
				if (err){
					return res.send(response.error(400, 'Image uploading failed', []));
				}
			});
			fileName = '/public/images/users/' + fileName;
			const _id = req.user._id;
			let userData = await User.findByIdAndUpdate(_id, {profile_image: fileName}, {new : true, runValidators: true} );
			return res.send(response.success(200, 'uploaded profile image successfully', {"profile_image": userData.profile_image} ));
		} else {
			return res.send(response.error(400, 'Please select an image', [] ));
		}
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(400, errorMessage.message, []));
		} else {
			errorLog(__filename, req.originalUrl, error);
			return res.send(response.error(500, 'Something want wrong', []));
		}
	}
}

exports.albumImageUpload = async (req, res) => {
	try {
		if (req.files && req.files.album_images) {
			let album_images = req.files.album_images;
			let uploadPath = __basedir + '/public/uploads/';
			let albumImageNameArray = req.user.album_images;

			if (Array.isArray(album_images)) {
				album_images.forEach(album_image => {
					if (album_image.mimetype !== "image/png" && album_image.mimetype !== "image/jpg" && album_image.mimetype !== "image/jpeg"){
						return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
					}
					if (album_image.size >= (1024 * 1024 * 5)) { // if getter then 5MB
						return res.send(response.error(400, 'Image must be less then 5MB', []));
					}
				});
				album_images.forEach(album_image => {
					let randomNumber = Math.floor(Math.random() * 100) + 1; //0-99 random number
					fileName = 'album-image-' + Date.now() + randomNumber + path.extname(album_image.name);
					album_image.mv(uploadPath + fileName, function(err) {
						if (err){
							return res.send(response.error(400, 'Image uploading failed', []));
						}
					});
					albumImageNameArray.push('/public/uploads/' + fileName);
				});
			} else {
				if (album_images.mimetype !== "image/png" && album_images.mimetype !== "image/jpg" && album_images.mimetype !== "image/jpeg"){
					return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
				}
				fileName = 'album-image-' + Date.now() + path.extname(album_images.name);
				album_images.mv(uploadPath + fileName, function(err) {
					if (err){
						return res.send(response.error(400, 'Image uploading failed', []));
					}
				});
				albumImageNameArray.push('/public/uploads/' + fileName);
			}
			await User.findByIdAndUpdate(req.user._id, {album_images: albumImageNameArray}, {new : true, runValidators: true} );
			return res.send(response.success(200, 'uploaded album images successfully', []));
		} else {
			return res.send(response.error(400, 'Please select an image', [] ));
		}
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(400, errorMessage.message, []));
		} else {
			errorLog(__filename, req.originalUrl, error);
			return res.send(response.error(500, 'Something want wrong', []));
		}
	}
}

exports.albumImageDelete = async (req, res) => {
	try {
		const userData = await User.findOne({_id: req.user._id});
		const image_name = req.body.album_image_name;
		const DIR = "public/uploads";

		let existsAlbumImage = userData.album_images.filter(function(item) {
			if (item) { // if album_image name exists
				return item.toLowerCase().indexOf(image_name.toLowerCase()) >= 0;
			}
		});

		let fileExists = fs.existsSync(DIR +'/'+ image_name);

		if (existsAlbumImage.length > 0 && fileExists) {	
			fs.unlinkSync(DIR+'/'+image_name); // delete from directory

			const filteredAlbumImages = userData.album_images.filter(function(item) {
				if (item) { // album_image array remove deleted image name value
					return item.toLowerCase().indexOf(image_name.toLowerCase()) <= 0;
				}
			});
			const updateUser = await User.findByIdAndUpdate(req.user._id, {album_images: filteredAlbumImages}, {new : true, runValidators: true} );
			return res.send(response.success(200, 'Image Delete successfully', [] ));
		} else {
			return res.send(response.error(400, 'Image not exists', []));
		}
		
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.changePassword = async (req, res) => {
	try {
		const _id = req.user._id;
		const userData = await User.findOne({ _id: _id }).select("+password");
		if (userData) {
			const isMatch = await bcrypt.compare(req.body.old_password, userData.password);
			if (isMatch) {
				const updateUser = await User.findByIdAndUpdate(_id, {password: req.body.new_password}, {new : true, runValidators: true} );
				return res.send(response.success(200, 'Password Change successfully', []));
			} else {
				return res.send(response.error(400, 'Currant Password is wrong', []));
			}
		} else {
			return res.send(response.error(400, 'Data Not found', []));
		}
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(400, errorMessage.message, []));
		} else {
			errorLog(__filename, req.originalUrl, error);
			return res.send(response.error(500, 'Something want wrong', []));
		}
	}
}

exports.deleteUser = async (req, res) => {
	try {
		const deleteUser = await User.findByIdAndDelete(req.user._id);
		if (deleteUser) {
			return res.send(response.success(200, 'User is Deleted', []));
		} else {
			return res.send(response.error(400, 'User not found', []));
		}
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.updateLocation = async (req,res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['longitude','latitude'];
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
	if (!isValidOperation) {
		return res.send(response.error(400, 'Invalid update fields!', [] ));
	}
	try {
		const _id = req.user._id;
		const longitude = parseFloat(req.body.longitude);
		const latitude = parseFloat(req.body.latitude);
		const updateUsers = await User.findByIdAndUpdate(_id, { location: { type: "Point", coordinates: [longitude, latitude] } }, {new: true, runValidators: true} );

		const userData = {};
		userData.location = updateUsers.location;

		return res.send(response.success(200, 'location update successfully', []));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}


exports.allUsersList = async (req,res) => {
	try {
		let UserData = await User.find().populate({path: 'question_answer.question_id'});
		// db.users.updateMany({gender: "2"}, {$set: {gender: 2}}) //in mongodb compass shell query

		return res.send(response.success(200, 'success', UserResource(UserData))); //UserResource(UserData)
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.languageList = async (req,res) => {
	try {
		let ProfileLanguageData = await ProfileLanguage.find();
		return res.send(response.success(200, 'success', ProfileLanguageData));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', [] ));
	}
}
