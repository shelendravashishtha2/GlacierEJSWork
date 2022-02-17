const PpmEquipmentMaster = require("../../models/PpmEquipmentMaster");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const response = require("../../helper/response");
const {errorLog} = require("../../helper/consoleLog");
const Joi = require("joi");
const PpmEquipmentAssign = require("../../models/PpmEquipmentAssign");
const PpmEquipmentAssetAssign = require("../../models/PpmEquipmentAssetAssign");

exports.ppmTaskDetail = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmId: Joi.string().min(24).max(24).required(),
			taskId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		// let ppmTaskList = await PpmEquipmentAssign.findOne({ _id: req.body.ppmId, status: 1 });
		// if(!ppmTaskList){
		// 	return res.send(response.error(400, 'PPM Not Found', []));
		// }
		// let index;
		// for(let i=0;i<ppmTaskList.assets.length;i++){
		// 	if(String(ppmTaskList.assets[i]._id) == String(req.body.taskId)){
		// 		index = i;
		// 	}
		// }
		// if(index == -1){
		// 	return res.send(response.error(400, 'PPM Task Not Found', []));
		// }

		let ppmTaskList = await PpmEquipmentAssetAssign.findOne({ _id: ObjectId(req.body.taskId), assignPpmEquipmentId: ObjectId(req.body.ppmId), status: 1 }).populate({path: 'assignPpmEquipmentId'});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
			data: [ppmTaskList]
		    // data: [{
		    // 	_id:ppmTaskList._id,
		    // 	ppmEquipmentName:ppmTaskList.ppmEquipmentName,
		    // 	task:[{
		    // 		assetName: ppmTaskList.assets[index].assetName,
		    // 		vendorName: ppmTaskList.assets[index].vendorName,
		    // 		frequency: ppmTaskList.assets[index].frequency,
			// 		day: ppmTaskList.assets[index].day,
			// 		date: ppmTaskList.assets[index].date,
			// 		month: ppmTaskList.assets[index].month,
		    // 	}],
		    // }]
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmTaskList = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmId: Joi.string().min(24).max(24).required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		// let condition = {"$match": {_id: ObjectId(req.body.ppmId), status:1}};
		// let condition1 = {"$match": {"assets.status":1}};
		// let group = {
		// 	$group:{
		// 		_id:"$_id",
		// 		ppmEquipmentName:{$first:"$ppmEquipmentName"},
		// 		assets:{
		// 			$push:{
        //                 _id:"$assets._id",
		// 				assetName: "$assets.assetName",
		// 				frequency: "$assets.frequency",
		// 				day: "$assets.day",
		// 				date: "$assets.date",
		// 				vendorName: "$assets.vendorName",
		// 				month: "$assets.month",
		// 				status:"t"
		// 			}
		// 		}
		// 	}
		// }
		// let unwind = {
        //     $unwind: {
        //         path: "$assets",
        //         preserveNullAndEmptyArrays: true
        //     }
        // }
		// let ppmTaskList = await PpmEquipmentAssign.aggregate([condition,unwind,condition1,group])

		let ppmTaskList = await PpmEquipmentAssetAssign.find({ assignPpmEquipmentId: ObjectId(req.body.ppmId), status:1 })

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task list",
		    data: ppmTaskList
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
exports.ppmList = async (req, res) => {
	try {
		// let condition = {"$match": {status:1}};
		// let project = {
		// 	$project:{
		// 		ppmEquipmentName:"$ppmEquipmentName",
		// 		status:"$status"
		// 	}
		// }
		// let ppmList = await PpmEquipmentAssign.aggregate([project])
		let ppmList = await PpmEquipmentAssign.find({status: 1}).select({ppmEquipmentName: 1, status: 1})
		
		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM List",
		    data: ppmList
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Property Wise PPM List
exports.propertiesWisePpmList = async (req,res) => {
	try {
		let schema = Joi.object({
			projectId:Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let project = {
			$project:{
				_id:{_id:1},
				ppmEquipmentName:{ppmEquipmentName:1}
			}
		}
       
		let ppmData = await PpmEquipmentAssign.aggregate([project]);

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "Property wise ppm list",
		    data: ppmData
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.editppmEquipmentName = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmId: Joi.string().min(24).max(24).required(),
			ppm_name: Joi.string().required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		// const exists = await PpmEquipmentAssign.findOne({ ppmEquipmentName: req.body.ppm_name });
		// if(exists) {
		// 	return res.send(response.error(400, 'PPM name already exists', [] ));
		// }
		if(req.body.ppmId){
			const updateData = await PpmEquipmentAssign.findByIdAndUpdate(req.body.ppmId, {ppmEquipmentName: req.body.ppm_name}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'PPM name updated', []));
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.activeInactiveStatus = async (req, res) => {
	try {
		let schema = Joi.object({
			ppmId: Joi.string().min(24).max(24).required(),
			status: Joi.string().min(1).max(1).required() // 0 = Inactive & 1 = Active
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		if(req.body.ppmId){
			const updateData = await PpmEquipmentAssign.findByIdAndUpdate(req.body.ppmId, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.createNewPPM = async (req,res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.required(),
			ppmEquipmentName: Joi.required(),
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
		if (!['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(req.body.day)) {
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

		let PpmEquipmentAssignData = await PpmEquipmentAssign.create({
			propertyId: req.body.propertyId,
			ppmEquipmentName: req.body.ppmEquipmentName,
		})
		console.log(req.body);
		if (PpmEquipmentAssignData) {
			let PpmEquipmentAssetAssignData = await PpmEquipmentAssetAssign.create({
				propertyId: req.body.propertyId,
				assignPpmEquipmentId: PpmEquipmentAssignData._id,
				assetName: req.body.assetName,
				assetLocation: req.body.assetLocation,
				vendorName: req.body.vendorName,
				frequency: req.body.frequency,
				day: day,
				month: month,
				date: date,
			})
		}

		return res.send(response.success(200, 'PPM task added', []));
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Update PPM Task
exports.updatePpmTask = async (req,res) => {
	try {
		let schema = Joi.object({
			ppmId: Joi.required(),
			taskId: Joi.required(),
			month: Joi.optional(),
			date: Joi.optional(),
			day: Joi.optional(),
			assetName: Joi.required(),
			vendorName: Joi.required(),
			frequency: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let ppm = await PpmEquipmentAssign.findOne({_id:req.body.ppmId});
		if(!ppm){
			return res.send(response.error(500, 'ppmId not valid', []));
		}
		let alreadyIndex = ppm.assets.findIndex((x)=> String(x.assetName) == req.body.assetName && String(x._id) != req.body.taskId );
		if(alreadyIndex != -1){
			return res.send(response.error(500, 'Asset name already exist', []));
		}
		let message = "";
		let obj = {
			assetName: req.body.assetName,
			vendorName: req.body.vendorName,
			frequency: req.body.frequency,
			day: req.body.day,
			month: req.body.month,
			date: req.body.date
		}
		if(req.body.taskId){
			let index = ppm.assets.findIndex((x)=> String(x._id) == req.body.taskId);
			obj._id = req.body.taskId;
			ppm.assets[index] = obj;
			message = "Task updated successfully";
		}else{
			ppm.assets.push(obj);
			message = "Task added successfully";
		}
		ppm.markModified('assets');
		ppm.save(function(err){
			console.log(err);
		});
		return res.send(response.success(200, message, []));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

