const PpmEquipmentMaster = require("../../../models/PpmEquipmentMaster");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const response = require("../../../helper/response");
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const fs = require('fs');
const path = require("path");
// const util = require('util');
// const mv = require('mv');
// const mvPromise = util.promisify(mv);
const {promisify} = require('util');
const mv = promisify(fs.rename);
const {join} = require('path');
const PpmEquipmentAssign = require("../../../models/PpmEquipmentAssign");
const PpmEquipmentAssetAssign = require("../../../models/PpmEquipmentAssetAssign");
const PpmTaskAssign = require("../../../models/PpmTaskAssign");
const { convertObjValuesToString, prependToArray } = require("../../../helper/commonHelpers");
const daysEnum = require("../../../enum/daysEnum");
const User = require("../../../models/User");
const CategoryFrcAssignTask = require("../../../models/CategoryFrcAssignTask");

exports.ppmEquipmentList = async (req, res) => {
	try {
		let findQuery = {
			propertyId: req.user.property_id
		}
		findQuery.dueDate = {
			$gte: moment().startOf('day'),
			$lte: moment().endOf('day')
		}
		let PpmTaskAssignData = await PpmTaskAssign.find(findQuery).populate({path: 'assignPpmEquipmentId', match: {supervisorId: req.user._id}});

		PpmTaskAssignData = PpmTaskAssignData.filter(item => item.assignPpmEquipmentId != null).map((item) => item.assignPpmEquipmentId); // null populate obj remove

		PpmTaskAssignData = PpmTaskAssignData.filter((value,index,array)=>array.findIndex(item=>(item._id===value._id))===index); // duplicate object remove

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmTaskAssignData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmEquipmentTaskList = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmEquipmentId: Joi.string().min(24).max(24).optional(),
			Date: Joi.optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let findQuery = {
			propertyId: req.user.property_id,
			completionStatus: {$in: [1,2]}
		}
		if (req.body.ppmEquipmentId) {
			findQuery.assignPpmEquipmentId = ObjectId(req.body.ppmEquipmentId)
		}
		if (req.body.Date) {
			findQuery.dueDate = {
				$gte: moment(req.body.Date, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(req.body.Date, 'DD-MM-YYYY').endOf('day')
			}
		}
		let PpmTaskAssignData = await PpmTaskAssign.find(findQuery);

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmTaskAssignData
		});

		// let schema = Joi.object({
		// 	ppmEquipmentId: Joi.string().min(24).max(24).required(),
		// });
		// let validation = schema.validate(req.body, __joiOptions);
		// if (validation.error) {
		// 	return res.send(response.error(400, validation.error.details[0].message, [] ));
		// }

		// let findQuery = {
		// 	propertyId: req.user.property_id
		// }
		// findQuery.dueDate = {
		// 	$gte: moment().startOf('day'),
		// 	$lte: moment().endOf('day')
		// }
		// let PpmTaskAssignData = await PpmTaskAssign.find(findQuery).populate({path: 'assignPpmEquipmentId', match: {_id: req.body.ppmEquipmentId, supervisorId: req.user._id}}).populate({path: 'assignPpmEquipmentAssetId'});
		// PpmTaskAssignData = PpmTaskAssignData.filter(item => item.assignPpmEquipmentId != null); // null populate obj remove
		// PpmTaskAssignData = PpmTaskAssignData.filter(item => item.assignPpmEquipmentAssetId != null); // null populate obj remove

		// return res.status(200).send({
		//     "status": true,
        //     "status_code": "200",
        //     "message": "PPM task details",
		// 	data: PpmTaskAssignData
		// });
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmEquipmentTaskSubmit = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmTaskId: Joi.string().min(24).max(24).required(),
			remark: Joi.required(),
			riskAssessmentStatus: Joi.required(),
			riskAssessmentAssetStatusColor: Joi.optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		if (req.files) {
			let uploadPath = __basedir + '/public/uploads/ppm_files/';
			let errorStatus = false;
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
						let fileName = 'ppm-task-image-' + req.body.ppmTaskId + '-' + Date.now() + randomNumber + path.extname(fileData.name);
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
						// let filePath = '/public/uploads/ppm_files/' + fileName;
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
						let fileName = 'ppm-task-image-' + req.body.ppmTaskId + '-' + Date.now() + randomNumber + path.extname(fileData.name);
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
						// let filePath = '/public/uploads/ppm_files/' + fileName;
						let filePath = fileName;
						serviceReportsArray.push(filePath);
					}
				}
			}
			if (errorStatus) {
				return res.send(response.error(400, 'Image uploading failed', []));
			}
			
			req.body.attachPhotos = attachPhotosArray
			console.log(attachPhotosArray,'attachPhotosArray');
			req.body.serviceReports = serviceReportsArray
			console.log(serviceReportsArray,'serviceReportsArray');
		}

		const updateData = await PpmTaskAssign.findOneAndUpdate({_id: req.body.ppmTaskId}, {
				completionDate: new Date(),
				completionBy: req.user._id,
				completionStatus: 3, //1=pending, 2=In-progress 3=completed 4=incomplete
				remark: req.body.remark,
				attachPhotos: req.body.attachPhotos,
				serviceReports: req.body.serviceReports,
				riskAssessmentStatus: req.body.riskAssessmentStatus, //1=No Risk, 2=Asset itself 3=environment
				riskAssessmentAssetStatusColor: req.body.riskAssessmentAssetStatusColor,
			}, {new:true,runValidators:true});

		return res.status(200).send({
		    status: true,
            status_code: "200",
            message: "PPM task details",
			data: 'updateData'
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmEquipmentList = async (req, res) => {
	try {
		// if (!req.user.property_id || req.user.property_id.length <= 0) { return res.send(response.error(400, 'property not assigned', [])) }

		let PpmEquipmentAssignData = await PpmEquipmentAssign.find({ propertyId: req.user.property_id});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmEquipmentAssignData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.createPpmEquipment = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmEquipmentName: Joi.string().required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		// if (!req.user.property_id || req.user.property_id.length <= 0) { return res.send(response.error(400, 'property not assigned', [])) }

		let PpmEquipmentAssignData = await PpmEquipmentAssign.create({
			propertyId: req.user.property_id,
			ppmEquipmentName: req.body.ppmEquipmentName,
		})

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmEquipmentAssignData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.updatePpmEquipment = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmEquipmentId: Joi.string().min(24).max(24).required(),
			ppmEquipmentName: Joi.required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		const updateData = await PpmEquipmentAssign.findOneAndUpdate({_id: req.body.ppmEquipmentId}, 
			{ppmEquipmentName: req.body.ppmEquipmentName}, 
			{new:true,runValidators:true});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: updateData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmEquipmentStatusChange = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmEquipmentId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		const PpmEquipmentAssignData = await PpmEquipmentAssign.findOne({_id: req.body.ppmEquipmentId});
		if (PpmEquipmentAssignData) {
			PpmEquipmentAssignData.status = PpmEquipmentAssignData.status == 1 ? 0 : 1;
			await PpmEquipmentAssignData.save();
		} 

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: [PpmEquipmentAssignData]
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmAssetList = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmEquipmentId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		// if (!req.user.property_id || req.user.property_id.length <= 0) { return res.send(response.error(400, 'property not assigned', [])) }

		let PpmEquipmentAssetAssignData = await PpmEquipmentAssetAssign.find({propertyId: req.user.property_id, assignPpmEquipmentId: ObjectId(req.body.ppmEquipmentId)});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmEquipmentAssetAssignData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.createPpmAsset = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmEquipmentId: Joi.string().min(24).max(24).required(),
			assetName: Joi.required(),
			assetLocation: Joi.optional(),
			vendorName: Joi.required(),
			frequency: Joi.required(),
			month: Joi.optional(),
			date: Joi.optional(),
			day: Joi.optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		// if (!req.user.property_id || req.user.property_id.length <= 0) { return res.send(response.error(400, 'property not assigned', [])) }

		req.body.day = req.body.day ? req.body.day.charAt(0).toUpperCase() + req.body.day.slice(1) : req.body.day;
		let daysArr = Object.keys(daysEnum);
		let days = prependToArray('',daysArr);
		if (!days.includes(req.body.day)) {
			req.body.day = '';
		}

		let day, month, date;
		if (req.body.frequency == 'Weekly') {
			day = req.body.day;
		} else if (req.body.frequency == 'Fortnightly') {
			date = req.body.date;
		} else if (req.body.frequency == 'Monthly') {
			date = req.body.date;
		} else if (req.body.frequency == 'Quarterly') {
			date = req.body.date;
			month = req.body.month;
		} else if (req.body.frequency == 'Annually') {
			date = req.body.date;
			month = req.body.month;
		} else if (req.body.frequency == 'Bi-Annually') {
			date = req.body.date;
			month = req.body.month;
		}

		let PpmEquipmentAssetAssignData = await PpmEquipmentAssetAssign.create({
			propertyId: req.user.property_id,
			assignPpmEquipmentId: req.body.ppmEquipmentId,
			assetName: req.body.assetName,
			assetLocation: req.body.assetLocation,
			vendorName: req.body.vendorName,
			frequency: req.body.frequency,
			day: day,
			month: month,
			date: date,
		})

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmEquipmentAssetAssignData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmAssetDetails = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmAssetId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let PpmEquipmentAssetAssignData = await PpmEquipmentAssetAssign.findOne({_id: ObjectId(req.body.ppmAssetId)});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: [PpmEquipmentAssetAssignData]
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.updatePpmAsset = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmAssetId: Joi.string().min(24).max(24).required(),
			assetName: Joi.required(),
			assetLocation: Joi.optional(),
			vendorName: Joi.required(),
			frequency: Joi.required(),
			month: Joi.optional(),
			date: Joi.optional(),
			day: Joi.optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		// if (!req.user.property_id || req.user.property_id.length <= 0) { return res.send(response.error(400, 'property not assigned', [])) }

		req.body.day = req.body.day ? req.body.day.charAt(0).toUpperCase() + req.body.day.slice(1) : req.body.day;
		let daysArr = Object.keys(daysEnum);
		let days = prependToArray('',daysArr);
		if (!days.includes(req.body.day)) {
			req.body.day = '';
		}

		let day, month, date;
		if (req.body.frequency == 'Weekly') {
			day = req.body.day;
		} else if (req.body.frequency == 'Fortnightly') {
			date = req.body.date;
		} else if (req.body.frequency == 'Monthly') {
			date = req.body.date;
		} else if (req.body.frequency == 'Quarterly') {
			date = req.body.date;
			month = req.body.month;
		} else if (req.body.frequency == 'Annually') {
			date = req.body.date;
			month = req.body.month;
		} else if (req.body.frequency == 'Bi-Annually') {
			date = req.body.date;
			month = req.body.month;
		}

		let PpmEquipmentAssetAssignData = await PpmEquipmentAssetAssign.findOneAndUpdate({_id: ObjectId(req.body.ppmAssetId)},{
				propertyId: req.user.property_id,
				assignPpmEquipmentId: req.body.ppmEquipmentId,
				assetName: req.body.assetName,
				assetLocation: req.body.assetLocation,
				vendorName: req.body.vendorName,
				frequency: req.body.frequency,
				day: day,
				month: month,
				date: date,
			},{new:true,runValidators:true});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmEquipmentAssetAssignData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmAssetStatusChange = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmAssetId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		const PpmEquipmentAssetAssignData = await PpmEquipmentAssetAssign.findOne({_id: req.body.ppmAssetId});
		if (PpmEquipmentAssetAssignData) {
			PpmEquipmentAssetAssignData.status = PpmEquipmentAssetAssignData.status == 1 ? 0 : 1;
			await PpmEquipmentAssetAssignData.save();
		} 

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: [PpmEquipmentAssetAssignData]
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmTaskDetails = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmTaskId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let PpmTaskAssignData = await PpmTaskAssign.findOne({_id: ObjectId(req.body.ppmTaskId)}).populate({path: 'propertyId', select: ['property_name']}).lean();

		let responseArray = [PpmTaskAssignData].map((obj) => {
			obj.hasOwnProperty('completionBy') ? '' : obj.completionBy = ''
			obj.hasOwnProperty('completionDate') ? '' : obj.completionDate = ''
			obj.hasOwnProperty('riskAssessmentAssetStatusColor') ? '' : obj.riskAssessmentAssetStatusColor = '#4ee020'
			return convertObjValuesToString(obj)
		})

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: responseArray
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.supervisorList = async (req, res) => {
	try {
		let supervisorData = await User.find({property_id: req.user.property_id, position_id: 5}).select(['full_name']).lean();

		return res.status(200).send({
		    status: true,
            status_code: "200",
            message: "success",
			data: supervisorData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.supervisorPpmEquipmentList = async (req, res) => {
	try {
		let schema = Joi.object({
			supervisorId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let PpmEquipmentAssignData = await PpmEquipmentAssign.find({supervisorId: req.body.supervisorId}).lean();

		return res.status(200).send({
		    status: true,
            status_code: "200",
            message: "success",
			data:  PpmEquipmentAssignData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.storePpmEquipmentAssignSupervisor = async (req, res) => {
	try {
		let schema = Joi.object({
			supervisorId: Joi.string().min(24).max(24).required(),
			PpmEquipmentAssignIds: Joi.array().items(Joi.objectId().label('Ppm Equipment id').required().messages({'string.pattern.name': `{{#label}} is invalid`})),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let {supervisorId, PpmEquipmentAssignIds} = req.body;

		let PpmEquipmentAssignData = await PpmEquipmentAssign.updateMany({_id: {$in: PpmEquipmentAssignIds}}, {supervisorId: supervisorId}, {new:true,runValidators:true});

		return res.status(200).send({
		    status: true,
            status_code: "200",
            message: "success",
			data:  []
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Start History
exports.frcHistoryCategoryList = async (req, res) => {
	try {
		let schema = Joi.object({
			startDate: Joi.required(),
			endDate: Joi.required(),
			// status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { startDate, endDate } = req.body;

		let findQuery = {
			propertyId: req.user.property_id,
			status: 1,
			completionStatus: 2, //1=pending, 2=completed, 3=incomplete
			dueDate: {
				$gte: moment(startDate, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(endDate, 'DD-MM-YYYY').endOf('day')
			}
		}
		let CategoryFrcAssignTaskData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryId', match: {status: 1}, populate: {path: 'categoryId', match: {status: 1}}});
		
		CategoryFrcAssignTaskData = CategoryFrcAssignTaskData.filter(item => item.assignCategoryId && item.assignCategoryId.categoryId).map(item => {
			return {
				_id: item.assignCategoryId._id, //assignCategoryId
				category_name: item.assignCategoryId.categoryId.category_name,
				status: item.assignCategoryId.status
			}
		})

		CategoryFrcAssignTaskData = CategoryFrcAssignTaskData.filter((value, index, array) => array.findIndex(item => (item._id == value._id)) == index); // duplicate object remove

		return res.send(response.success(200, 'success', CategoryFrcAssignTaskData));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.frcHistoryCategoryTaskList = async (req, res) => {
	try {
		let schema = Joi.object({
			categoryId: Joi.string().min(24).max(24).required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			// status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { categoryId, startDate, endDate } = req.body;

		let findQuery = {
			propertyId: req.user.property_id,
			status: 1,
			completionStatus: 2, //1=pending, 2=completed, 3=incomplete
			dueDate: {
				$gte: moment(startDate, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(endDate, 'DD-MM-YYYY').endOf('day')
			}
		}
		let CategoryFrcAssignTaskData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryId', match: {_id: categoryId, status: 1}, populate: {path: 'categoryId', match: {status: 1}}}).populate({path: 'assignCategoryFrcId', match: {status: 1}, select: '-form'});
		
		CategoryFrcAssignTaskData = CategoryFrcAssignTaskData.filter(item => item.assignCategoryId && item.assignCategoryId.categoryId && item.assignCategoryFrcId)

		return res.send(response.success(200, 'success', CategoryFrcAssignTaskData));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmHistoryEquipmentList = async (req, res) => {
	try {
		let schema = Joi.object({
			startDate: Joi.required(),
			endDate: Joi.required(),
			// status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { startDate, endDate } = req.body;

		let findQuery = { 
			propertyId: req.user.property_id,
			status: 1,
			completionStatus: 3, //1=pending, 2=In-progress 3=completed 4=incomplete
			dueDate: {
				$gte: moment(startDate, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(endDate, 'DD-MM-YYYY').endOf('day')
			}
		}
		let PpmTaskAssignData = await PpmTaskAssign.find(findQuery).populate({path: 'assignPpmEquipmentId', match: {status: 1}, select: '-supervisorId'})//.populate({path: 'assignPpmEquipmentAssetId'});

		PpmTaskAssignData = PpmTaskAssignData.filter(item => item.assignPpmEquipmentId).map(item => {
			return item.assignPpmEquipmentId
		})

		PpmTaskAssignData = PpmTaskAssignData.filter((value, index, array) => array.findIndex(item => (item._id == value._id)) == index); // duplicate object remove
		
		return res.status(200).send({
		    status: true,
            status_code: "200",
            message: "PPM History",
		    data: PpmTaskAssignData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmHistoryEquipmentTaskList = async (req, res) => {
	try {
		let schema = Joi.object({
			equipmentId: Joi.string().min(24).max(24).required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			// status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { equipmentId, startDate, endDate } = req.body;

		let findQuery = { 
			propertyId: req.user.property_id,
			status: 1,
			completionStatus: 3, //1=pending, 2=In-progress 3=completed 4=incomplete
			dueDate: {
				$gte: moment(startDate, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(endDate, 'DD-MM-YYYY').endOf('day')
			}
		}
		let PpmTaskAssignData = await PpmTaskAssign.find(findQuery).populate({path: 'assignPpmEquipmentId', match: {_id: equipmentId,status: 1}, select: '-supervisorId'}) //.populate({path: 'assignPpmEquipmentAssetId'});

		PpmTaskAssignData = PpmTaskAssignData.filter(item => item.assignPpmEquipmentId);

		return res.status(200).send({
		    status: true,
            status_code: "200",
            message: "PPM History",
		    data: PpmTaskAssignData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
// End History