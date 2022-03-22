const Category = require("../../../models/CategoryMaster");
const CategoryChecklist = require("../../../models/CategoryFrcMaster");
const CategoryFrcAssignTask = require("../../../models/CategoryFrcAssignTask");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const response = require("../../../helper/response");
const Joi = require('joi');
const PpmTaskAssign = require("../../../models/PpmTaskAssign");
const CategoryAssign = require("../../../models/CategoryAssign");
Joi.objectId = require('joi-objectid')(Joi);

exports.frcHistoryCategoryList = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			// status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, startDate, endDate } = req.body;

		let findQuery = {
			propertyId: propertyId,
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
			propertyId: Joi.string().min(24).max(24).required(),
			categoryId: Joi.string().min(24).max(24).required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			// status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, categoryId, startDate, endDate } = req.body;

		let findQuery = {
			propertyId: propertyId,
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
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			// status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, startDate, endDate } = req.body;

		let findQuery = { 
			propertyId: propertyId,
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
			propertyId: Joi.string().min(24).max(24).required(),
			equipmentId: Joi.string().min(24).max(24).required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			// status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, equipmentId, startDate, endDate } = req.body;

		let findQuery = { 
			propertyId: propertyId,
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