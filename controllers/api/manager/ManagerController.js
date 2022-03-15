const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const response = require("../../../helper/response");
const User = require("../../../models/User");
const PpmEquipmentMaster = require("../../../models/PpmEquipmentMaster");
const CategoryMaster = require("../../../models/CategoryMaster");
const CategoryFrcMaster = require("../../../models/CategoryFrcMaster");
const Property = require("../../../models/Property");
const CategoryAssign = require("../../../models/CategoryAssign");
const CategoryFrcAssign = require("../../../models/CategoryFrcAssign");
const CategoryFrcAssignTask = require("../../../models/CategoryFrcAssignTask");
const SOP = require('../../../models/SOP');
const SettingRating = require("../../../models/SettingRating");
const Rating = require("../../../models/Rating");
const PpmTaskAssign = require("../../../models/PpmTaskAssign");
const path = require("path");

exports.categoryList = async (req, res) => {
	try {
		// if (!req.user.property_id || req.user.property_id.length <= 0) { return res.send(response.error(400, 'property not assigned', [])) }

		let categoryData = await CategoryAssign.find({propertyId: req.user.property_id, managerId: req.user._id})
				.populate({path: 'categoryId', select: ['category_name']});

		categoryData = categoryData.filter(item => item.categoryId != null).map((item) => {
			let data = {
				assignCategoryId: item._id,
				categoryName: item.categoryId.category_name
			}
			return data
		})

		return res.status(200).send(response.success(200, 'Success', categoryData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.categoryFrcTodayTaskList = async (req, res) => {
	try {
		let schema = Joi.object({
			categoryId: Joi.string().min(24).max(24).optional(),
			// date: Joi.string().optional(),
			frequency: Joi.string().optional(),
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		// if (!req.user.property_id || req.user.property_id.length <= 0) { return res.send(response.error(400, 'property not assigned', [])) }

		let findQuery = {
			propertyId: req.user.property_id,
			dueDate: {
				$gte: moment().startOf('day'),
				$lte: moment().endOf('day')
			},
			completionStatus: 1
		}
		if (req.query.categoryId) {
			findQuery.assignCategoryId = ObjectId(req.query.categoryId)
		}
		let findQuery2 = {};
		if (req.query.frequency) {
			findQuery2.frequency = req.query.frequency
		}
		let categoryFrcData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryFrcId', match: findQuery2, select: ['checklist_id','checklist_name','type','frequency']});
		categoryFrcData = categoryFrcData.filter(item => item.assignCategoryFrcId != null)

		return res.status(200).send(response.success(200, 'Success', categoryFrcData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.categoryFrcIncompleteTaskList = async (req, res) => {
	try {
		let schema = Joi.object({
			categoryId: Joi.string().min(24).max(24).optional(),
			date: Joi.string().optional()
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		// if (!req.user.property_id || req.user.property_id.length <= 0) { return res.send(response.error(400, 'property not assigned', [])) }

		let findQuery = {
			propertyId: req.user.property_id,
			// completionStatus: {$ne: 2}
			completionStatus: 3
		}
		if (req.query.categoryId) {
			findQuery.assignCategoryId = ObjectId(req.query.categoryId)
		}
		if (req.query.date) {
			findQuery.dueDate = {
				$gte: moment(req.query.date, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(req.query.date, 'DD-MM-YYYY').endOf('day')
			}
		}
		let categoryFrcData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryFrcId', select: ['checklist_id','checklist_name','type','frequency']});

		return res.status(200).send(response.success(200, 'Success', categoryFrcData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.categoryFrcList = async (req, res) => {
	try {
		let schema = Joi.object({
			categoryId: Joi.string().min(24).max(24).required(),
			frequency: Joi.string().optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		// if (!req.user.property_id || req.user.property_id.length <= 0) { return res.send(response.error(400, 'property not assigned', [])) }

		let findQuery = {
			propertyId: req.user.property_id,
			assignCategoryId: ObjectId(req.body.categoryId),
			status: 1
		}
		if (req.body.frequency) {
			findQuery.frequency = req.body.frequency
		}
		let categoryFrcData = await CategoryFrcAssign.find(findQuery).lean();

		categoryFrcData = categoryFrcData.map(item => {
			item.percentage = 0;
			return item;
		})

		return res.status(200).send(response.success(200, 'Success', categoryFrcData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.createSupervisor = async (req, res) => {
	try {
		let schema = Joi.object({
			full_name: Joi.string().min(3).max(150).required(),
			email: Joi.string().min(6).max(100).required().email(),
			mobile_no: Joi.string().min(10).max(12).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		const existsUser = await User.findOne({ email: req.body.email, mobile_no: req.body.mobile_no });
		if(existsUser) {
			if (existsUser.email == req.body.email) {
				return res.send(response.error(400, 'email id already exists', [] ));
			} else if (existsUser.mobile_no == req.body.mobile_no) {
				return res.send(response.error(400, 'mobile no already exists', [] ));
			}
		}

		if (req.files) {
			let uploadPath = __basedir + '/public/uploads/ppm_files/';
			if (req.files.profile_image) {
				let profile_image = req.files.profile_image;
				if (profile_image.mimetype !== "image/png" && profile_image.mimetype !== "image/jpg" && profile_image.mimetype !== "image/jpeg"){
					return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
				}
				if (profile_image.size >= (1024 * 1024 * 50)) { // if getter then 50MB
					return res.send(response.error(400, 'Image must be less then 50MB', []));
				}
				fileName = 'profile-image-' + req.user._id + '-' + Date.now() + path.extname(profile_image.name);
				const uploadFile = () => {
					return new Promise((resolve, reject) => { //upload the file, then call the callback with the location of the file
						profile_image.mv(uploadPath + fileName, function(error) {
							if (error) {
								reject(error)
								return res.send(response.error(400, 'Image uploading failed', []));
							}
							resolve('image uploaded successfully')
						});
					})
				}
				await uploadFile();
				req.body.profile_image = fileName;
			}
		}

		const registerUser = new User({
			full_name: req.body.full_name,
			email: req.body.email,
			mobile_no: req.body.mobile_no,
            password: '123456',
            profile_image: req.body.profile_image,
			position_id: 5, // user type
			position_type: "Supervisor",
			property_id: req.user.property_id, // Property list
		});
		const registeredData = await registerUser.save();

		return res.status(200).send(response.success(200, 'Success', registeredData ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(400, errorMessage.message, [] ));
		} else {
			errorLog(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong', [] ));
		}
	}
}