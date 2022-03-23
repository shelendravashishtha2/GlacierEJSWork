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

		let findQuery = {
			propertyId: req.user.property_id,
			completionStatus: {$ne: 2}, // not equal to complete
		}
		if (req.query.categoryId) {
			findQuery.assignCategoryId = ObjectId(req.query.categoryId)
		}
		if (req.query.date) {
			findQuery.dueDate = {
				$gte: moment(req.query.date, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(req.query.date, 'DD-MM-YYYY').endOf('day')
			}
		} else {
			findQuery.dueDate = {
				$lte: moment().startOf('day'),
			}
		}
		let categoryFrcData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryFrcId', select: ['checklist_id','checklist_name','type','frequency']});

		return res.status(200).send(response.success(200, 'Success', categoryFrcData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.frcTaskFormDetails = async (req,res) => {
	try {
		let schema = Joi.object({
			formId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { formId } = req.body;

		let findQuery = {
			_id: ObjectId(formId),
		}
		let categoryFrcData = await CategoryFrcAssignTask.find(findQuery).select(['form']).lean(); //.populate({path: 'assignCategoryFrcId', select: ['checklist_id','checklist_name','type','frequency']});
		categoryFrcData = categoryFrcData.map(item => {
			let data = {
				formId: item._id,
				form: item.form
			}
			return data
		})

		return res.status(200).send(response.success(200, 'Success', categoryFrcData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.frcTaskFormSubmit = async (req,res) => {
	try {
		let schema = Joi.object({
			formId: Joi.string().min(24).max(24).required(),
			form: Joi.required(),
		}); 
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		// file storing in the form is pending
		// ------------------------------------

		let formDetail = await CategoryFrcAssignTask.findOne({_id: req.body.formId})
		if(!formDetail){
			return res.send(response.error(400, 'FRC form not found', [] ));
		}
		formDetail.form = req.body.form;

		let percentage = 0;
		let array = ["button","paragraph","header"];
		let count = 0;
		let completeCount = 0;
		for(let i=0;i<req.body.form.length;i++){
			if(array.indexOf(req.body.form[i].type) == -1){
				count++;
				if(req.body.form[i].value && req.body.form[i].value.length > 0){
					completeCount++;
				}
			}
		}
		formDetail.percentage = Math.ceil((completeCount * 100)/count);
		formDetail.completionBy = req.user._id;
		formDetail.completionDate = new Date();
		formDetail.completionStatus = 2; //1=pending, 2=completed, 3=incomplete
		await formDetail.save()

		return res.status(200).send({
		    "status": true,
			"status_code": "200",
			"message": "Checklist form submit",
		    data: formDetail
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.frcTaskRemarkSubmit = async (req,res) => {
	try {
		let schema = Joi.object({
			formId: Joi.string().min(24).max(24).required(),
			remark: Joi.required(),
		}); 
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		if (req.files) {
			let uploadPath = __basedir + '/public/uploads/frc_files/';
			let attachPhotosArray = [];
			let serviceReportsArray = [];

			if (req.files.attachPhotos) {
				let attachPhotos = req.files.attachPhotos;
				attachPhotos = Array.isArray(attachPhotos) ? attachPhotos : [attachPhotos]
				if (attachPhotos.length > 0) {
					attachPhotos.forEach(fileData => {
						if (fileData.mimetype !== "image/png" && fileData.mimetype !== "image/jpg" && fileData.mimetype !== "image/jpeg"){
							return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
						}
						if (fileData.size >= (1024 * 1024 * 50)) { // if getter then 50MB
							return res.send(response.error(400, 'Image must be less then 50MB', []));
						}
					});				
					for (let i = 0; i < attachPhotos.length; i++) {
						const fileData = attachPhotos[i];
						let randomNumber = Math.floor(Math.random() * 100) + 1; //0-99 random number
						let fileName = 'frc-task-' + req.body.formId + '-' + Date.now() + randomNumber + path.extname(fileData.name);
						const uploadFile = () => {
							return new Promise((resolve, reject) => { //upload the file, then call the callback with the location of the file
								fileData.mv(uploadPath + fileName, function(error) {
									if (error) {
										reject(error)
										return res.send(response.error(400, 'Image uploading failed 1', []));
									}
									resolve('image uploaded successfully')
								});
							})
						}
						await uploadFile();
						let filePath = fileName;
						attachPhotosArray.push(filePath);
					}
				}
			}
			if (req.files.serviceReports) {
				let serviceReports = req.files.serviceReports;
				serviceReports = Array.isArray(serviceReports) ? serviceReports : [serviceReports]
				if (serviceReports.length > 0) {
					serviceReports.forEach(fileData => {
						// if (fileData.mimetype !== "image/png" && fileData.mimetype !== "image/jpg" && fileData.mimetype !== "image/jpeg"){
						// 	return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
						// }
						if (fileData.size >= (1024 * 1024 * 50)) { // if getter then 50MB
							return res.send(response.error(400, 'File must be less then 50MB', []));
						}
					});				
					for (let i = 0; i < serviceReports.length; i++) {
						const fileData = serviceReports[i];
						let randomNumber = Math.floor(Math.random() * 100) + 1; //0-99 random number
						let fileName = 'frc-task-' + req.body.formId + '-' + Date.now() + randomNumber + path.extname(fileData.name);
						const uploadFile = () => {
							return new Promise((resolve, reject) => { //upload the file, then call the callback with the location of the file
								fileData.mv(uploadPath + fileName, function(error) {
									if (error) {
										reject(error)
										return res.send(response.error(400, 'Image uploading failed 2', []));
									}
									resolve('image uploaded successfully')
								});
							})
						}
						await uploadFile();
						let filePath = fileName;
						serviceReportsArray.push(filePath);
					}
				}
			}
			
			req.body.attachPhotos = attachPhotosArray;
			console.log(attachPhotosArray,'attachPhotosArray');
			req.body.serviceReports = serviceReportsArray;
			console.log(serviceReportsArray,'serviceReportsArray');
		}

		const updateData = await CategoryFrcAssignTask.findOneAndUpdate({_id: req.body.formId}, {
				remark: req.body.remark,
				attachPhotos: req.body.attachPhotos,
				serviceReports: req.body.serviceReports,
			}, {new:true,runValidators:true});

		return res.status(200).send({
			status: true,
			status_code: "200",
			message: "FRC task remark submitted",
			data: updateData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.todayCategoryList = async (req,res) => {
	try {
		let findQuery = {
			propertyId: req.user.property_id,
			dueDate: {
				$gte: moment().startOf('day'),
				$lte: moment().endOf('day')
			},
			completionStatus: 1, // Pending
			status: 1,
		}

		let categoryIds = await CategoryFrcAssignTask.find(findQuery).distinct('assignCategoryId');
		let categoryData = await CategoryAssign.find({_id: {$in: categoryIds}, status: 1}).populate({path: 'categoryId', match: {status: 1}}).lean();
		categoryData = categoryData.filter(item => item.categoryId != null).map(item => {
			return {
				_id: item._id,
				category_name: item.categoryId.category_name,
				status: item.status
			}
		})

		return res.status(200).send(response.success(200, 'Success', categoryData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.todayCategoryFrcList = async (req,res) => {
	try {
		let schema = Joi.object({
			categoryId: Joi.string().min(24).max(24).optional(),
			frequency: Joi.string().optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let {categoryId} = req.body;

		let findQuery = {
			propertyId: req.user.property_id,
			dueDate: {
				$gte: moment().startOf('day'),
				$lte: moment().endOf('day')
			},
			completionStatus: 1, // Pending
			status: 1,
		}
		if (categoryId) {
			findQuery.assignCategoryId = ObjectId(categoryId);
		}
		let categoryFrcIds = await CategoryFrcAssignTask.find(findQuery).distinct('assignCategoryFrcId');
		let categoryFrcTaskData = await CategoryFrcAssignTask.find(findQuery);
		
		let findQuery2 = {
			_id: {$in: categoryFrcIds},
			status: 1
		};
		if (req.body.frequency) {
			findQuery2.frequency = req.body.frequency;
		}
		let categoryFrcData = await CategoryFrcAssign.find(findQuery2).select('checklist_id checklist_name').populate({path: 'assignCategoryId', match: {status: 1}}).lean();

		categoryFrcData = categoryFrcData.filter(item => item.assignCategoryId).map((item) => {
			let findIndex = categoryFrcTaskData.findIndex(findItem => String(item._id) == String(findItem.assignCategoryFrcId));
			if (findIndex != -1) {
				item.formId = categoryFrcTaskData[findIndex]._id
				item.percentage = categoryFrcTaskData[findIndex].percentage
			}
			return {
				_id: item._id,
				checklist_id: item.checklist_id,
				checklist_name: item.checklist_name,
				formId: item.formId,
				percentage: item.percentage
			}
		})

		return res.status(200).send(response.success(200, 'Success', categoryFrcData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.incompleteCategoryList = async (req,res) => {
	try {
		let findQuery = {
			propertyId: req.user.property_id,
			completionStatus: {$ne: 2}, // Pending
			status: 1,
		}

		let categoryIds = await CategoryFrcAssignTask.find(findQuery).distinct('assignCategoryId');
		let categoryData = await CategoryAssign.find({_id: {$in: categoryIds}, status: 1}).populate({path: 'categoryId', match: {status: 1}}).lean();
		categoryData = categoryData.filter(item => item.categoryId != null).map(item => item.categoryId)

		return res.status(200).send(response.success(200, 'Success', categoryData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.incompleteCategoryFrcList = async (req, res) => {
	try {
		let schema = Joi.object({
			categoryId: Joi.string().min(24).max(24).optional(),
			date: Joi.string().optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let {categoryId} = req.body;

		let findQuery = {
			propertyId: req.user.property_id,
			completionStatus: {$ne: 2}, // not equal to complete
			status: 1,
		}
		if (categoryId) {
			findQuery.assignCategoryId = ObjectId(categoryId);
		}
		if (req.body.date) {
			findQuery.dueDate = {
				$gte: moment(req.body.date, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(req.body.date, 'DD-MM-YYYY').endOf('day')
			}
		} else {
			findQuery.dueDate = {
				$lte: moment().startOf('day'),
			}
		}

		let categoryFrcIds = await CategoryFrcAssignTask.find(findQuery).distinct('assignCategoryFrcId');
		let categoryFrcTaskData = await CategoryFrcAssignTask.find(findQuery);
		
		let categoryFrcData = await CategoryFrcAssign.find({_id: {$in: categoryFrcIds}, status: 1}).select('checklist_id checklist_name').populate({path: 'assignCategoryId', match: {status: 1}}).lean();

		categoryFrcData = categoryFrcData.filter(item => item.assignCategoryId).map((item) => {
			let findIndex = categoryFrcTaskData.findIndex(findItem => String(item._id) == String(findItem.assignCategoryFrcId));
			if (findIndex != -1) {
				item.formId = categoryFrcTaskData[findIndex]._id
				item.percentage = categoryFrcTaskData[findIndex].percentage
			}
			return {
				_id: item._id,
				checklist_id: item.checklist_id,
				checklist_name: item.checklist_name,
				formId: item.formId,
				percentage: item.percentage
			}
		})

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
			let uploadPath = __basedir + '/public/uploads/user_files/';
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

exports.supervisorList = async (req, res) => {
	try {
		let supervisorData = await User.find({property_id: req.user.property_id, position_id: 5}).populate({path: 'property_id', select: ['property_name','wings']}).lean();
		// let categoryData = await CategoryAssign.find({supervisorId: req.user._id})

		return res.status(200).send({
		    status: true,
            status_code: "200",
            message: "success",
			urlPath: process.env.APP_URL + '/public/uploads/user_files/',
			data: supervisorData.map((item) => { return {
				_id: item._id,
				full_name: item.full_name ? item.full_name : "",
				profile_image: item.profile_image ? item.profile_image : "",
				status: item.status ? item.status : 0,
				// property_id: item.property_id ? item.property_id : [],
				// category_list: [{
				// 	_id: "61cab7dd09a0e36f4e7bc2c6",
				// 	category_name: "category 1"
				// }],
			}})
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.supervisorDetails = async (req, res) => {
	try {
		let schema = Joi.object({
			supervisorId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let supervisorData = await User.findOne({position_id: 5, _id: ObjectId(req.body.supervisorId)}).populate({path: 'property_id', select: ['property_name','wings']}).lean();
		if (!supervisorData) { return res.send(response.error(400, 'user not found', [])); }

		let categoryData = await CategoryAssign.find({supervisorId: ObjectId(req.body.supervisorId)}).populate({path: 'categoryId'})
		categoryData = categoryData.filter(item => item.categoryId != null).map(item => {
			let data = {
				assignCategoryId: item._id,
				categoryName: item.categoryId.category_name
			}
			return data
		})

		return res.status(200).send({
		    status: true,
            status_code: "200",
            message: "success",
			urlPath: process.env.APP_URL + '/public/uploads/user_files/',
			data: [{
				_id: supervisorData._id,
				full_name: supervisorData.full_name ? supervisorData.full_name : "",
				profile_image: supervisorData.profile_image ? supervisorData.profile_image : "",
				mobile_no: supervisorData.mobile_no ? supervisorData.mobile_no : "",
				email: supervisorData.email ? supervisorData.email : "",
				status: supervisorData.status ? supervisorData.status : 0,
				property_id: supervisorData.property_id ? supervisorData.property_id : [],
				category_list: categoryData,
			}]
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.propertyDetails = async (req, res) => {
	try {
		let propertyData = await Property.findOne({_id: {$in: req.user.property_id}}).lean();

		// categoryFrcData = categoryFrcData.map(item => {
		// 	item.percentage = 0;
		// 	return item;
		// })

		return res.status(200).send(response.success(200, 'Success', propertyData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.assignmentCategory = async (req, res) => {
	try {
		let schema = Joi.object({
			assignCategoryIds: Joi.array().items(Joi.objectId().label('assign category id').required().messages({'string.pattern.name': `{{#label}} is invalid`})),
			wingIds: Joi.array().items(Joi.objectId().label('wing id').required().messages({'string.pattern.name': `{{#label}} is invalid`})),
			supervisorIds: Joi.array().items(Joi.objectId().label('supervisor id').required().messages({'string.pattern.name': `{{#label}} is invalid`})),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let {assignCategoryIds, wingIds, supervisorIds} = req.body

		for (let i = 0; i < assignCategoryIds.length; i++) {
			let CategoryAssignData = await CategoryAssign.findOneAndUpdate({_id: assignCategoryIds[i]},{
				wingIds: wingIds,
				supervisorId: supervisorIds
			},{new:true,runValidators:true});
		}

		return res.status(200).send(response.success(200, 'Success', [] ));
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