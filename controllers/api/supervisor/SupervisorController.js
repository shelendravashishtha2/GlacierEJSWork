const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require("joi");
const Property = require("../../../models/Property");
const User = require("../../../models/User");
const CategoryFrcAssignTask = require("../../../models/CategoryFrcAssignTask");
const SettingRating = require("../../../models/SettingRating");
const CategoryChecklist = require("../../../models/CategoryFrcMaster");
const SOP = require("../../../models/SOP");
const response = require("../../../helper/response");
const PPM = require("../../../models/PpmEquipmentMaster");
const Rating = require("../../../models/Rating");
const UserProperty = require("../../../models/UserProperty");
const CategoryAssign = require("../../../models/CategoryAssign");
const CategoryFrcAssign = require("../../../models/CategoryFrcAssign");

exports.categoryList = async (req, res) => {
	try {
		let PropertyData = await UserProperty.findOne({userId: req.user._id});

		let categoryData = await CategoryAssign.find({propertyId: PropertyData.propertyId, supervisorId: ObjectId(req.user._id)})
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

exports.categoryChecklist = async (req, res) => {
	try {
		let schema = Joi.object({
			categoryId: Joi.string().min(24).max(24).optional(),
			frequency: Joi.string().optional(),
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let PropertyData = await UserProperty.findOne({userId: req.user._id});

		let findQuery = {
			propertyId: PropertyData.propertyId,
			dueDate: {
				$gte: moment().startOf('day'),
				$lte: moment().endOf('day')
			},
			completionStatus: 1
		}
		if (req.query.categoryId) {
			findQuery.assignCategoryId = ObjectId(req.query.categoryId)
		}
		// let categoryFrcData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryFrcId', match: {supervisorId: req.user._id}, select: ['checklist_id','checklist_name','type','frequency']});
		let categoryFrcData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryFrcId', match: {frequency: req.query.frequency}, select: ['checklist_id','checklist_name','type','frequency']});
		categoryFrcData = categoryFrcData.filter(item => item.assignCategoryFrcId != null)

		return res.status(200).send(response.success(200, 'Success', categoryFrcData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.incompleteCategoryChecklist = async (req, res) => {
	try {
		let schema = Joi.object({
			categoryId: Joi.string().min(24).max(24).optional(),
			date: Joi.string().optional()
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let PropertyData = await UserProperty.findOne({userId: req.user._id});

		let findQuery = {
			propertyId: PropertyData.propertyId,
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
		// let categoryFrcData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryFrcId', match: {supervisorId: req.user._id}, select: ['checklist_id','checklist_name','type','frequency']});
		let categoryFrcData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryFrcId', select: ['checklist_id','checklist_name','type','frequency']});
		categoryFrcData = categoryFrcData.filter(item => item.assignCategoryFrcId != null)

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

		let PropertyData = await UserProperty.findOne({userId: req.user._id});

		let findQuery = {
			propertyId: PropertyData.propertyId,
			assignCategoryId: ObjectId(req.body.categoryId),
			// supervisorId: req.user._id,
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