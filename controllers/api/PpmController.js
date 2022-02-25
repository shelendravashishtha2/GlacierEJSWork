const PpmEquipmentMaster = require("../../models/PpmEquipmentMaster");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const response = require("../../helper/response");
const {errorLog} = require("../../helper/consoleLog");
const Joi = require("joi");
const PpmEquipmentAssign = require("../../models/PpmEquipmentAssign");
const PpmEquipmentAssetAssign = require("../../models/PpmEquipmentAssetAssign");
const PpmTaskAssign = require("../../models/PpmTaskAssign");

exports.ppmEquipmentList = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let PpmEquipmentAssignData = await PpmEquipmentAssign.find({ propertyId: ObjectId(req.body.propertyId)});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmEquipmentAssignData
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.createPpmEquipment = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
			ppmEquipmentName: Joi.required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let PpmEquipmentAssignData = await PpmEquipmentAssign.create({
			propertyId: req.body.propertyId,
			ppmEquipmentName: req.body.ppmEquipmentName,
		})

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmEquipmentAssignData
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.updatePpmEquipment = async (req, res) => {
	try {
		let schema = Joi.object({
			// propertyId: Joi.string().min(24).max(24).required(),
			ppmEquipmentId: Joi.string().min(24).max(24).required(),
			ppmEquipmentName: Joi.required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		const updateData = await PpmEquipmentAssign.findOneAndUpdate({_id: req.body.ppmEquipmentId}, 
			{ppmEquipmentName: req.body.ppmEquipmentName}, 
			{new: true, runValidators: true});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: updateData
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
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
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmAssetList = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
			ppmEquipmentId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let PpmEquipmentAssetAssignData = await PpmEquipmentAssetAssign.find({propertyId: ObjectId(req.body.propertyId), assignPpmEquipmentId: ObjectId(req.body.ppmEquipmentId)});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmEquipmentAssetAssignData
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.createPpmAsset = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
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
			propertyId: req.body.propertyId,
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
		errorLog(__filename, req.originalUrl, error);
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
		errorLog(__filename, req.originalUrl, error);
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
				propertyId: req.body.propertyId,
				assignPpmEquipmentId: req.body.ppmEquipmentId,
				assetName: req.body.assetName,
				assetLocation: req.body.assetLocation,
				vendorName: req.body.vendorName,
				frequency: req.body.frequency,
				day: day,
				month: month,
				date: date,
			},{new: true, runValidators: true});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: PpmEquipmentAssetAssignData
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
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
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmTaskList = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
			EquipmentId: Joi.string().min(24).max(24).optional(),
			Date: Joi.optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let findQuery = {
			propertyId: ObjectId(req.body.propertyId)
		}
		if (req.body.EquipmentId) {
			findQuery.assignPpmEquipmentId = ObjectId(req.body.EquipmentId)
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
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
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

		let PpmTaskAssignData = await PpmTaskAssign.findOne({_id: ObjectId(req.body.ppmTaskId)});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: [PpmTaskAssignData]
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}