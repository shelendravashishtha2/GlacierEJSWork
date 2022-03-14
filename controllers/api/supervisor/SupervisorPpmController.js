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
		let findQuery = {
			propertyId: req.user.property_id
		}
		findQuery.dueDate = {
			$gte: moment().startOf('day'),
			$lte: moment().endOf('day')
		}
		let PpmTaskAssignData = await PpmTaskAssign.find(findQuery).populate({path: 'assignPpmEquipmentId', match: {supervisorId: req.user._id}}).populate({path: 'assignPpmEquipmentAssetId'});
		PpmTaskAssignData = PpmTaskAssignData.filter(item => item.assignPpmEquipmentId != null); // null populate obj remove
		PpmTaskAssignData = PpmTaskAssignData.filter(item => item.assignPpmEquipmentAssetId != null); // null populate obj remove

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

exports.ppmEquipmentTaskSubmit = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmTaskId: Joi.string().min(24).max(24).required(),
			remark: Joi.required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		if (req.files && req.files.attachPhotos) {
			let attachPhotos = req.files.attachPhotos;
			let uploadPath = __basedir + '/public/uploads/ppm/';
			let albumImageNameArray = [];
			let errorStatus = false;

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

				// attachPhotos.forEach(fileData => {
				// 	let randomNumber = Math.floor(Math.random() * 100) + 1; //0-99 random number
				// 	let fileName = 'ppm-task-image-' + req.body.ppmTaskId + '-' + Date.now() + randomNumber + path.extname(fileData.name);
				// 	console.log(uploadPath + fileName);
				// 	fileData.mv(uploadPath + fileName, function(error) {
				// 		if (error) {
				// 			errorStatus = true;
				// 			errorLog(error, __filename, req.originalUrl);
				// 		}
      			// 		else {
				// 			console.log("File Uploaded");
				// 		}
				// 	});
				// 	let filePath = '/public/uploads/ppm/' + fileName;
				// 	albumImageNameArray.push(filePath);
				// });
				
				for (let i = 0; i < attachPhotos.length; i++) {
					const fileData = attachPhotos[i];
					let randomNumber = Math.floor(Math.random() * 100) + 1; //0-99 random number
					let fileName = 'ppm-task-image-' + req.body.ppmTaskId + '-' + Date.now() + randomNumber + path.extname(fileData.name);
					fileData.mv(uploadPath + fileName, function(error) {
						if (error) {
							errorStatus = true;
							errorLog(error, __filename, req.originalUrl);
						}
						else {
							console.log("File Uploaded");
						}
					});
					// const original = fileData.name;
  					// const target = join(uploadPath, fileName);
					// console.log(original,'original');
					// console.log(target,'target');
					// await mv(original, target);
					// await mv(fileData, uploadPath + fileName)
					let filePath = '/public/uploads/ppm/' + fileName;
					albumImageNameArray.push(filePath);
				}
				if (errorStatus) {
					return res.send(response.error(400, 'Image uploading failed', []));
				}
			}
			// req.body.attachPhotos = albumImageNameArray
			console.log(albumImageNameArray,'albumImageNameArray');
		}

		// const updateData = await PpmTaskAssign.findOneAndUpdate({_id: req.body.ppmTaskId}, {
		// 		remark: req.body.remark,
		// 		attachPhotos: req.body.attachPhotos,
		// 	}, {new:true,runValidators:true});

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