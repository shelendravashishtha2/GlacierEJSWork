const PPM = require("../../models/PPM");
const wingPPMS = require("../../models/wingPPMS");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const response = require("../../helper/response");
const {errorLog} = require("../../helper/consoleLog");
const Joi = require("joi");

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
		let ppmTaskList = await PPM.findOne({_id:req.body.ppmId,status:1});
		if(!ppmTaskList){
			return res.send(response.error(400, 'PPM Not Found', []));
		}
		let index;
		for(let i=0;i<ppmTaskList.assets.length;i++){
			if(String(ppmTaskList.assets[i]._id) == String(req.body.taskId)){
				index = i;
			}
		}
		if(index == -1){
			return res.send(response.error(400, 'PPM Task Not Found', []));
		}
		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "PPM task details",
		    data: [{
		    	_id:ppmTaskList._id,
		    	ppmEquipmentName:ppmTaskList.ppmEquipmentName,
		    	task:[{
		    		assetName: ppmTaskList.assets[index].assetName,
		    		vendorName: ppmTaskList.assets[index].vendorName,
		    		frequency: ppmTaskList.assets[index].frequency,
					day: ppmTaskList.assets[index].day,
					date: ppmTaskList.assets[index].date,
					month: ppmTaskList.assets[index].month,
		    	}],
		    }]
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
		let condition = {"$match": {_id: ObjectId(req.body.ppmId),status:1}};
		let condition1 = {"$match": {"assets.status":1}};
		let group = {
			$group:{
				_id:"$_id",
				ppmEquipmentName:{$first:"$ppmEquipmentName"},
				assets:{
					$push:{
                        _id:"$assets._id",
						assetName: "$assets.assetName",
						frequency: "$assets.frequency",
						day: "$assets.day",
						date: "$assets.date",
						vendorName: "$assets.vendorName",
						month: "$assets.month",
						status:"t"
					}
				}
			}
		}
		let unwind = {
            $unwind: {
                path: "$assets",
                preserveNullAndEmptyArrays: true
            }
        }
		let ppmTaskList = await PPM.aggregate([condition,unwind,condition1,group])
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
		let condition = {"$match": {status:1}};
		let project = {
			$project:{
				ppmEquipmentName:"$ppmEquipmentName",
				status:"$status"
			}
		}
		
		let ppmList = await PPM.aggregate([project])
		
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
		let winglist = await wingPPMS.find({propertyId:req.body.projectId});
		let ppmArray = [];
		for(let i =0;i<winglist.length;i++){
			for(let j =0;j<winglist[i].ppmIds.length;j++){
				ppmArray.push(winglist[i].ppmIds[j]);
			}
		}
		let project = {
			$project:{
				_id:{_id:1},
				ppmEquipmentName:{ppmEquipmentName:1}
			}
		}
       
		let ppmData = await PPM.aggregate([project]);
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

		const exists = await PPM.findOne({ ppmEquipmentName: req.body.ppm_name });
		if(exists) {
			return res.send(response.error(400, 'PPM name already exists', [] ));
		}
		if(req.body.ppmId){
			const updateData = await PPM.findByIdAndUpdate(req.body.ppmId, {ppmEquipmentName: req.body.ppm_name}, {new: true, runValidators: true});
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
			const updateData = await PPM.findByIdAndUpdate(req.body.ppmId, {status: req.body.status}, {new: true, runValidators: true});
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
			ppmEquipmentName: Joi.required(),
			month: Joi.optional(),
			date: Joi.optional(),
			assetName: Joi.required(),
			vendorName: Joi.required(),
			frequency: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		const exists = await PPM.findOne({ ppmEquipmentName: req.body.ppmEquipmentName });
		if(exists) {
			return res.send(response.error(400, 'PPM name already exists', [] ));
		}
		
		let obj = new PPM({
			ppmEquipmentName: req.body.ppmEquipmentName,
			status: 1,
			assets:[
			{
				assetName: req.body.assetName,
				vendorName: req.body.vendorName,
				frequency: req.body.frequency,
            	month: req.body.month,
            	date: req.body.date,
            	created_by: req.user._id,
            	updated_by: req.user._id,
				status: 1
			}]
		});
		let propertyData = await obj.save();
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
		let ppm = await PPM.findOne({_id:req.body.ppmId});
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
		console.log(obj);
		ppm.save(function(err){
			console.log(err);
		});
		return res.send(response.success(200, message, []));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

