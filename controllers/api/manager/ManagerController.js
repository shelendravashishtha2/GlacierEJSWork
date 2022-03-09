const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require("joi");
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
const UserProperty = require("../../../models/UserProperty");
const PpmTaskAssign = require("../../../models/PpmTaskAssign");

exports.categoryList = async (req, res) => {
	try {
		let userPropertyData = await UserProperty.findOne({userId: req.user._id});

		let categoryData = await CategoryAssign.find({propertyId: userPropertyData.propertyId, managerId: req.user._id})
				.populate({path: 'categoryId', model: 'Category_Master', select: ['category_name']});

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

		let userPropertyData = await UserProperty.findOne({userId: req.user._id});

		let findQuery = {
			propertyId: userPropertyData.propertyId,
			dueDate: {
				$gte: moment().startOf('day'),
				$lte: moment().endOf('day')
			},
			completionStatus: 1
		}
		if (req.query.categoryId) {
			findQuery.assignCategoryId = ObjectId(req.query.categoryId)
		}
		let categoryFrcData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryFrcId', match: {frequency: req.query.frequency}, select: ['checklist_id','checklist_name','type','frequency']});
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

		let userPropertyData = await UserProperty.findOne({userId: req.user._id});

		let findQuery = {
			propertyId: userPropertyData.propertyId,
			completionStatus: 2
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

		let userPropertyData = await UserProperty.findOne({userId: req.user._id});

		let findQuery = {
			propertyId: userPropertyData.propertyId,
			assignCategoryId: ObjectId(req.body.categoryId),
			status: 1
		}
		if (req.body.frequency) {
			findQuery.frequency = req.body.frequency
		}
		let categoryFrcData = await CategoryFrcAssign.find(findQuery);

		return res.status(200).send(response.success(200, 'Success', categoryFrcData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}