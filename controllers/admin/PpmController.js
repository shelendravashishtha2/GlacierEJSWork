const PpmEquipment = require("../../models/PpmEquipmentMaster");
const PpmEquipmentAssign = require("../../models/PpmEquipmentAssign");
const PpmEquipmentAssetAssign = require("../../models/PpmEquipmentAssetAssign");
const Property = require("../../models/Property");
const PpmTaskAssign = require("../../models/PpmTaskAssign");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { errorLog } = require("../../helper/consoleLog");
const PropertyResource = require('../resources/PropertyResource');
const Joi = require("joi");

// PPM List Page 
exports.updatePpmStatus = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			ppmId: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let ppmDetail = await PpmEquipment.findOne({ _id: req.body.ppmId });
		if (ppmDetail.status == 0) {
			ppmDetail.status = 1;
		} else {
			ppmDetail.status = 0;
		}
		ppmDetail.save();
		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"message": "Status is updated!"
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
exports.updateppmEquipmentName = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			ppmId: Joi.required(),
			ppmEquipmentName: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let ppmDetail = await PpmEquipment.findOne({ _id: req.body.ppmId });
		if (!ppmDetail) {
			return res.send(response.error(500, 'Something want wrong', []));
		}
		let alreadyPpmDetail = await PpmEquipment.findOne({ _id: { $ne: req.body.ppmId }, ppmEquipmentName: req.body.ppmEquipmentName.trim() });
		if (alreadyPpmDetail) {
			return res.send(response.error(400, 'Equipment name already exists', []));
		}
		ppmDetail.ppmEquipmentName = req.body.ppmEquipmentName.trim();
		ppmDetail.save();

		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"message": "Equipment is updated!",
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
exports.updatePpmTaskStatus = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			ppmId: Joi.required(),
			assetId: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let ppmDetail = await PpmEquipment.findOne({ _id: req.body.ppmId });
		let index = ppmDetail.assets.findIndex((x) => String(x._id) == String(req.body.assetId));
		if (index == -1) {
			return res.redirect('/edit-ppm/' + req.body.ppmId);
		} else {
			if (ppmDetail.assets[index].status == 0) {
				ppmDetail.assets[index].status = 1;
			} else {
				ppmDetail.assets[index].status = 0
			}
			ppmDetail.markModified("assets");
			ppmDetail.save();
		}
		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"message": "Asset Status Updated!"
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
exports.updatePropertyWingStatus = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			propertyId: Joi.required(),
			wingId: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let propertyDetail = await Property.findOne({ _id: req.body.propertyId, status: 1 });
		let index = propertyDetail.wings.findIndex((x) => String(x._id) == String(req.body.wingId));
		if (index == -1) {
			return res.redirect('/assign-ppm');
		} else {
			if (propertyDetail.wings[index].status == 0) {
				propertyDetail.wings[index].status = 1;
			} else {
				propertyDetail.wings[index].status = 0
			}
			propertyDetail.markModified("wings");
			propertyDetail.save();
		}
		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"message": "Status update"
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
exports.createPpm = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			ppmEquipmentName: Joi.required(),
			month: Joi.optional(),
			date: Joi.optional(),
			day: Joi.optional(),
			assetName: Joi.required(),
			vendorName: Joi.required(),
			frequency: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			req.flash('error', validation.error.details[0].message);
		}

		const existsUser = await PpmEquipment.findOne({ ppmEquipmentName: req.body.ppmEquipmentName });
		if (existsUser) {
			req.flash('error', "PPM name already exists!");
			return res.redirect('back');
		}
		let obj = new PpmEquipment({
			ppmEquipmentName: req.body.ppmEquipmentName,
			status: 1,
			assets: [
				{
					assetName: req.body.assetName,
					vendorName: req.body.vendorName,
					frequency: req.body.frequency,
					month: req.body.month,
					date: req.body.date,
					day: req.body.day,
					created_by: req.session.user._id,
					updated_by: req.session.user._id,
					status: 1
				}]
		});
		req.flash('message', "Equipment name is added!");
		let ppmData = await obj.save();
		return res.redirect('/ppm');
	} catch (error) {
		let errorMessage = '';
		if (error.name == "ValidationError") {
			errorMessage = error.errors[Object.keys(error.errors)[0]];
			errorMessage = errorMessage.message;
		} else {
			errorLog(__filename, req.originalUrl, error);
			errorMessage = "Something want wrong";
		}
		req.flash('error', { errorMessage: errorMessage });
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}
exports.PpmList = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'PPM', session: req.session };
		let page = 1;
		if (req.query.page != undefined) {
			page = req.query.page;
		}
		let limit = { $limit: 10 };
		let skip = { $skip: (page - 1) * 10 };
		let project = {
			$project: {
				ppmEquipmentName: 1,
				status: 1,
				assets: 1
			}
		}
		let query1 = {};
		if (req.query.search) {
			query1 = { $or: [] };
			query1["$or"].push({ 'ppmEquipmentName': { $regex: new RegExp(req.query.search, 'i') } });
		}
		let search = { "$match": query1 };
		let totalProperty = await PpmEquipment.count(query1);
		totalPage = Math.ceil(totalProperty / 10);
		let sort = {
			$sort: {
				createdAt: -1
			}
		};
		let PpmEquipmentData = await PpmEquipment.aggregate([search, sort, skip, limit, project]);
		let monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		return res.render('Admin/PPM/index', {
            data: PpmEquipmentData,
            months: monthsList,
            page: page,
            totalPage: totalPage,
            search: req.query.search ? req.query.search : '',
            message: req.flash('message'),
            error: req.flash('error'),
        })
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.updatePpmTask = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmId: Joi.required(),
			assetId: Joi.optional(),
			month: Joi.optional(),
			date: Joi.optional(),
			day: Joi.optional(),
			assetName: Joi.required(),
			vendorName: Joi.required(),
			frequency: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let ppm = await PpmEquipment.findOne({ _id: req.body.ppmId });
		if (!ppm) {
			return res.redirect('/ppm');
		}
		let alreadyIndex = ppm.assets.findIndex((x) => String(x.assetName) == req.body.assetName && String(x._id) != req.body.assetId);
		if (alreadyIndex != -1) {
			req.flash('error', 'Asset name is already exist!');
			return res.redirect('/edit-ppm/' + req.body.ppmId);
		}
		let message = "";

		req.body.day = req.body.day ? req.body.day.charAt(0).toUpperCase() + req.body.day.slice(1) : req.body.day;
		if (!['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(req.body.day)) {
			req.body.day = '';
		}
		let obj = {
			assetName: req.body.assetName,
			vendorName: req.body.vendorName,
			frequency: req.body.frequency,
			day: req.body.day,
			month: req.body.month,
			date: req.body.date
		}
		if (req.body.assetId) {
			let index = ppm.assets.findIndex((x) => String(x._id) == req.body.assetId);
			obj._id = req.body.assetId;
			ppm.assets[index] = obj;
			message = "Asset name has been updated!";
		} else {
			ppm.assets.push(obj);
			message = "Asset name has been added!";
		// req.flash('message', message);
		}
		ppm.markModified('assets');
		await ppm.save();
		
		req.flash('message', message);
		return res.redirect('/ppm/');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.assignPpmEquipmentAssetList = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			pid: Joi.required(),
			id: Joi.required()
		});
		let validation = schema.validate(req.params, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		res.locals = { title: 'Edit PPM', session: req.session };

		let assignPpmEquipmentData = await PpmEquipmentAssign.findOne({ propertyId: req.params.pid, _id: req.params.id }).populate({ "path": "propertyId", "match": { "status": 1 } });
		console.log(assignPpmEquipmentData);
		let assignPpmEquipmentAssetData = await PpmEquipmentAssetAssign.find({ assignPpmEquipmentId: assignPpmEquipmentData._id });

		return res.render('Admin/PPM/assign-ppm-asset-list', {
			data: assignPpmEquipmentData,
			page: 1,
			totalPage: 1,
			taskData: assignPpmEquipmentAssetData,
			search: req.query.search ? req.query.search : "",
			message: req.flash('message'),
			error: req.flash('error')
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.updateAssignPpmEquipmentStatus = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			assignPpmEquipmentId: Joi.required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let assignPpmEquipmentDetail = await PpmEquipmentAssign.findOne({ _id: req.body.assignPpmEquipmentId });
		if (assignPpmEquipmentDetail.status == 0) {
			assignPpmEquipmentDetail.status = 1;
		} else {
			assignPpmEquipmentDetail.status = 0
		}
		assignPpmEquipmentDetail.save();

		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"message": "Status is update!"
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.editPpm = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			id: Joi.required()
		});
		let validation = schema.validate(req.params, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		res.locals = { title: 'Edit PPM', session: req.session };

		let page = 1;
		if (req.query.page != undefined) {
			page = req.query.page;
		}
		let limit = { $limit: 10 };
		let skip = { $skip: (page - 1) * 10 };
		let project = {
			$project: {
				taskId: "$assets._id",
				assetName: "$assets.assetName",
				frequency: "$assets.frequency",
				month: "$assets.month",
				date: "$assets.date",
				day: "$assets.day",
				status: "$assets.status",
				vendorName: "$assets.vendorName"
			}
		}
		let aggregateQuery = {
			$match: {
				_id: require('mongoose').Types.ObjectId(req.params.id)
			}
		};
		let unwind = {
			$unwind: "$assets"
		}
		let group = {
			$group: {
				_id: null,
				ppmId: { $first: "$_id" },
				status: { $first: "$status" },
				ppmEquipmentName: { $first: "$ppmEquipmentName" },
				total: { $sum: 1 }
			}
		};
		let ppmData = await PpmEquipment.aggregate([aggregateQuery, unwind, group]);
		if (ppmData.length == 0) {
			return res.redirect('/ppm');
		} else {
			ppmData = ppmData[0];
		}
		let totalPage = Math.ceil(ppmData.total / 10);
		let taskData = await PpmEquipment.aggregate([aggregateQuery, unwind, skip, limit, project]);

		return res.render('Admin/PPM/edit-ppm', {
			data: ppmData,
			page: page,
			totalPage: totalPage,
			taskData: taskData,
			search: req.query.search ? req.query.search : "",
			message: req.flash('message'),
			error: req.flash('error')
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// View PPM List
exports.viewPpmList = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'View PPM List', session: req.session };

		let page = 1;
		if (req.query.page != undefined) {
			page = req.query.page;
		}
		let limit = { $limit: 10 };
		let skip = { $skip: (page - 1) * 10 };
		let project = {
			$project: {
				property_name: 1,
				status: 1
			}
		}
		let sort = {
			$sort: {
				createdAt: -1
			}
		};
		let query1 = {};
		if (req.query.search) {
			query1['property_name'] = { $regex: new RegExp(req.query.search, 'i') };
		}
		let search = {
			"$match": {
				$and: [
					{ $or: [query1] },
					{ status: 1 }
				]
			}
		};
		let totalProperty = await Property.count(query1);
		totalPage = Math.ceil(totalProperty / 10);
		let propertyData = await Property.aggregate([search, sort, skip, limit, project]);
		return res.render('Admin/PPM/view-ppm-list', { 'data': propertyData, page: page, totalPage: totalPage, search: req.query.search ? req.query.search : "" });

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Assign Ppm Equipment 
exports.addPropertyWing = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }

		// delete data
		let equipmentIds = await PpmEquipmentAssign.find({propertyId: req.body.propertyId, ppmEquipmentName:{$nin:req.body.ppmNames}}).distinct('_id');
		await PpmEquipmentAssign.deleteMany({ propertyId: req.body.propertyId, ppmEquipmentName: { "$nin": req.body.ppmNames } });
		console.log(equipmentIds, 'EQUIPMENT ID');
		await PpmEquipmentAssetAssign.deleteMany({assignPpmEquipmentId:equipmentIds});
		for (let i = 0; i < req.body.ppmNames.length; i++) {
			let existsData = await PpmEquipmentAssign.findOne({ propertyId: req.body.propertyId, ppmEquipmentName: req.body.ppmNames[i] });
			if (!existsData) {
				// store Ppm Equipment
				let assignPpmEquipmentData = await PpmEquipmentAssign.create({
					propertyId: req.body.propertyId,
					ppmEquipmentName: req.body.ppmNames[i]
				})

				// store Ppm Equipment Asset
				let ppmEquipmentAssetData = await PpmEquipment.findOne({ ppmEquipmentName: req.body.ppmNames[i] });
				for (let j = 0; j < ppmEquipmentAssetData.assets.length; j++) {
					const element = ppmEquipmentAssetData.assets[j];

					let assignPpmEquipmentAssetData = await PpmEquipmentAssetAssign.create({
						propertyId: req.body.propertyId,
						ppmEquipmentId: req.body.ppmNames[i],
						assignPpmEquipmentId: assignPpmEquipmentData._id,
						assetName: element.assetName,
						assetLocation: '',
						vendorName: element.vendorName,
						frequency: element.frequency,
						month: element.month,
						date: element.date,
						day: element.day,
					})
				}
			}
		}

		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"message": "Property wing assign successfully"
		});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.propertyWingList = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }

		let PpmEquipmentData = await PpmEquipment.find({ status: 1 }, { ppmEquipmentName: 1 });
		let assignPpmEquipmentData = await PpmEquipmentAssign.find({ propertyId: req.query.propertyId })
				.populate({path: "propertyId", match: {status: 1} });

		console.log(assignPpmEquipmentData);
		
		return res.status(200).send({
			"status": true,
			"status_code": "200",
			ppm: PpmEquipmentData,
			assignPpmData: assignPpmEquipmentData
		});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.assignPpmList = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Assign PPM List', session: req.session };
		let propertyData = await Property.find({ status: 1 }, { property_name: 1 }).sort({ createdAt: -1 });

		return res.render('Admin/PPM/assign-ppm-list', { 'data': PropertyResource(propertyData) });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Property Wise PPM List
exports.propertiesWisePpmList = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			id: Joi.required()
		});
		let validation = schema.validate(req.params, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		res.locals = { title: 'Assign PPM List', session: req.session };

		let page = 1;
		if (req.query.page != undefined) {
			page = req.query.page;
		}
		let limit = { $limit: 10 };
		let skip = { $skip: (page - 1) * 10 };
		let project = {
			$project: {
				taskId: "$assets._id",
				assetName: "$assets.assetName",
				frequency: "$assets.frequency",
				month: "$assets.month",
				date: "$assets.date",
				status: "$assets.status",
				vendorName: "$assets.vendorName"
			}
		}
		let aggregateQuery = {
			// $match: {
			// 	_id: { $in: ppmArray }
			// }
		};
		let unwind = {
			$unwind: "$assets"
		}
		let group = {
			$group: {
				_id: null,
				ppmId: { $first: "$_id" },
				status: { $first: "$status" },
				ppmEquipmentName: { $first: "$ppmEquipmentName" },
				total: { $sum: 1 }
			}
		};
		let sort = {
			$sort: {
				createdAt: -1
			}
		};
		let ppmData = await PpmEquipment.aggregate([aggregateQuery, unwind, group]);
		if (ppmData.length == 0) {
			return res.redirect('/ppm');
		} else {
			ppmData = ppmData[0];
		}
		let totalPage = Math.ceil(ppmData.total / 10);
		let taskData = await PpmEquipment.aggregate([aggregateQuery, unwind, sort, skip, limit, project]);

		return res.render('Admin/PPM/property-wise-ppm-list', {
            data: { propertyId: req.params.id },
            page: page,
            totalPage: totalPage,
            taskData: taskData,
            message: req.query.message,
            error: req.query.error,
            search: req.query.search ? req.query.search : '',
        })
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

//  PPM Full Details
exports.ppmDetails = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Assign PPM List', session: req.session };
		let propertyData = await PpmEquipment.find({});
		return res.render('Admin/PPM/ppm-details', { 'data': PropertyResource(propertyData) });

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// add & update assign property ppm equipment Assets
exports.addUpdatePpmEquipmentAsset = async (req, res) => {
	try {
		let schema = Joi.object({
			assetId: Joi.optional(), //for update time
			assignPpmEquipmentId: Joi.required(),
			ppmEquipmentId: Joi.required(),
			propertyId: Joi.required(),
			assetName: Joi.required(),
			assetLocation: Joi.required(),
			vendorName: Joi.required(),
			frequency: Joi.required(),
			month: Joi.optional(),
			date: Joi.optional(),
			day: Joi.optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let assignPpmEquipmentData = await PpmEquipmentAssign.findOne({ _id: req.body.assignPpmEquipmentId, status: 1 });
		if (!assignPpmEquipmentData) {
			return res.redirect('/assign-ppm');
		}

		req.body.day = req.body.day ? req.body.day.charAt(0).toUpperCase() + req.body.day.slice(1) : req.body.day;
		if (!['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(req.body.day)) {
			req.body.day = '';
		}

		let assignPpmEquipmentAssetData
		if (req.body.assetId) {
			assignPpmEquipmentAssetData = await PpmEquipmentAssetAssign.findById(mongoose.Types.ObjectId(req.body.assetId));
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

		if (assignPpmEquipmentAssetData) {
			await PpmEquipmentAssetAssign.updateOne({ _id: req.body.assetId }, {
				propertyId: req.body.propertyId,
				ppmEquipmentId: req.body.ppmEquipmentId,
				assignPpmEquipmentId: assignPpmEquipmentData._id,
				assetName: req.body.assetName,
				assetLocation: req.body.assetLocation,
				vendorName: req.body.vendorName,
				frequency: req.body.frequency,
				month: month ? month : '',
				date: date ? date : '',
				day: day ? day : '',
			})

			message = "Equipment Asset is updated!";
			req.flash('message', message);
		} else {
			await PpmEquipmentAssetAssign.create({
				propertyId: req.body.propertyId,
				ppmEquipmentId: req.body.ppmEquipmentId,
				assignPpmEquipmentId: assignPpmEquipmentData._id,
				assetName: req.body.assetName,
				assetLocation: req.body.assetLocation,
				vendorName: req.body.vendorName,
				frequency: req.body.frequency,
				day: day,
				month: month,
				date: date,
			})

			message = "Equipment Asset is added!";
			req.flash('message', message);
		}

		return res.redirect('assign-ppm-equipment-asset-list/' + req.body.propertyId + '/' + assignPpmEquipmentData._id + '');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.updateAssignPpmEquipmentAssetStatus = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			assignPpmEquipmentAssetId: Joi.required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let assignPpmEquipmentAssetDetail = await PpmEquipmentAssetAssign.findOne({ _id: req.body.assignPpmEquipmentAssetId });
		if (assignPpmEquipmentAssetDetail.status == 0) {
			assignPpmEquipmentAssetDetail.status = 1;
		} else {
			assignPpmEquipmentAssetDetail.status = 0
		}
		assignPpmEquipmentAssetDetail.save();

		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"message": "Status is update!"
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// view Properties Ppm Task
exports.viewPropertiesPpmTask = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			id: Joi.required()
		});
		let validation = schema.validate(req.params, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		res.locals = { title: 'Assign PPM List', session: req.session };

		let assignPpmTaskData = await PpmTaskAssign.find({ propertyId: req.params.id }).populate({ path: 'assignPpmEquipmentAssetId', populate: { path: 'ppmEquipmentId' } }).populate({ path: 'assignPpmEquipmentId', populate: { path: 'ppmEquipmentId' } });

		return res.render('Admin/PPM/property-ppm-task-list', {
			data: { propertyId: req.params.id },
			page: 1,
			totalPage: 1,
			assignPpmTaskData: assignPpmTaskData,
			message: [],
			error: [],
			search: req.query.search ? req.query.search : ""
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// view Properties Ppm Task details
exports.viewPropertiesPpmTaskDetails = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			id: Joi.required()
		});
		let validation = schema.validate(req.params, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		res.locals = { title: 'Assign PPM List', session: req.session };

		let assignPpmTaskData = await PpmTaskAssign.findOne({ _id: req.params.id }).populate({ path: 'assignPpmEquipmentId', populate: { path: 'ppmEquipmentId' } });

		return res.render('Admin/PPM/property-ppm-task-list-details', {
			data: { propertyId: assignPpmTaskData.propertyId },
			page: 1,
			totalPage: 1,
			assignPpmTaskData: assignPpmTaskData,
			message: [],
			error: [],
			search: req.query.search ? req.query.search : ""
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}