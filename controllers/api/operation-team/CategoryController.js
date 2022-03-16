const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const response = require("../../../helper/response");
const User = require("../../../models/User");
const CategoryAssign = require("../../../models/CategoryAssign");
const CategoryFrcMaster = require("../../../models/CategoryFrcMaster");
const CategoryFrcAssign = require("../../../models/CategoryFrcAssign");
const CategoryFrcAssignTask = require("../../../models/CategoryFrcAssignTask");

exports.categoryList = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let categoryData = await CategoryAssign.find({propertyId: req.body.propertyId, operationTeamId: req.user._id})
				.populate({path: 'categoryId', model: 'Category_Master'});
		categoryData = categoryData.filter(item => item.categoryId != null).map(item => {
			let data = {
				assignCategoryId: item._id,
				categoryName: item.categoryId.category_name
			}
			return data
		})

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "Category list",
		    data: categoryData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
exports.categoryChecklist = async (req, res) => {
	try {
		let schema = Joi.object({
			categoryId: Joi.string().min(24).max(24).required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let findQuery = {
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

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "Category wise checklist",
		    data: categoryFrcData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.formDetail = async (req, res) => {
	try {
		let schema = Joi.object({
			CategoryChecklistId: Joi.string().min(24).max(24).required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let formDetail = await CategoryFrcAssign.findOne({_id: req.body.CategoryChecklistId},{form:1});
		if (!formDetail) {
			return res.send(response.error(400, "Category Checklist not found", [] ));
		}
		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "Checklist form details",
		    data: [formDetail]
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.getFormSubmittedDetail = async (req, res) => {
	try {
		let schema = Joi.object({
			formId: Joi.string().min(24).max(24).required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let formDetail = await CategoryFrcAssignTask.findOne({_id:req.body.formId})
		return res.status(200).send({
		    "status": true,
			"status_code": "200",
			"message": "Checklist form submit details",
		    data: formDetail
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.formSubmit = async (req, res) => {
	try {
		let schema = Joi.object({
			formId: Joi.string().min(24).max(24).optional(),
			categoryId: Joi.string().min(24).max(24).required(),
			categoryChecklistId: Joi.string().min(24).max(24).required(),
			userId: Joi.string().min(24).max(24).required(),
			form: Joi.optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let formDetail = await CategoryFrcAssignTask.findOne({_id:req.body.formId})
		if(formDetail){
			formDetail = await CategoryFrcAssignTask.findOne({_id:req.body.formId})
		}else{
			formDetail = new CategoryFrcAssignTask;
			formDetail.categoryId = req.body.categoryId;
			formDetail.categoryChecklistId = req.body.categoryChecklistId;
			formDetail.userId = req.body.userId;
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

exports.formList = async (req, res) => {
	try {
		const startDate = new Date("2021-11-10")
		const endDate = new Date("2021-11-20")

		//const startDate = new Date(req.body.startDate)
		//const endDate = new Date(req.body.endDate)

		const list = await CategoryFrcAssignTask.find({$and:[{createdAt:{$gte: startDate}},{endDate:{$lte: endDate}}]})
		if (!list) {
			return res.send(response.error(400, "FormList not found", [] ))
		}
		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"formList": list
		});		
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.todayCategoryFrcList = async (req,res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
			categoryId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let {propertyId, categoryId} = req.body;

		let findQuery = {
			propertyId: ObjectId(propertyId),
			assignCategoryId: ObjectId(categoryId),
			dueDate: {
				$gte: moment().startOf('day'),
				$lte: moment().endOf('day')
			},
			completionStatus: 1 // Pending
		}
		let categoryFrcTaskData = await CategoryFrcAssignTask.find(findQuery).distinct('assignCategoryFrcId');
		categoryFrcData = await CategoryFrcAssign.find({_id: {$in: categoryFrcTaskData}}).select(['checklist_id','checklist_name']).lean();

		return res.status(200).send(response.success(200, 'Success', categoryFrcData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.todayCategoryFrcTaskList = async (req,res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
			categoryId: Joi.string().min(24).max(24).required(),
			categoryFrcId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, categoryId, categoryFrcId } = req.body;

		let findQuery = {
			propertyId: ObjectId(propertyId),
			assignCategoryId: ObjectId(categoryId),
			assignCategoryFrcId: ObjectId(categoryFrcId),
			dueDate: {
				$gte: moment().startOf('day'),
				$lte: moment().endOf('day')
			},
			completionStatus: 1 // Pending
		}
		let categoryFrcData = await CategoryFrcAssignTask.find(findQuery).populate({path: 'assignCategoryFrcId', select: ['checklist_id','checklist_name','type','frequency']});
		categoryFrcData = categoryFrcData.filter(item => item.assignCategoryFrcId != null)

		return res.status(200).send(response.success(200, 'Success', categoryFrcData ));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.incompleteCategoryFrcTaskList = async (req,res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
			categoryId: Joi.string().min(24).max(24).required(),
			categoryFrcId: Joi.string().min(24).max(24).required(),
			date: Joi.string().optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, categoryId, categoryFrcId } = req.body;

		let findQuery = {
			propertyId: ObjectId(propertyId),
			assignCategoryId: ObjectId(categoryId),
			assignCategoryFrcId: ObjectId(categoryFrcId),
			completionStatus: {$ne: 2} // not equal to complete
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
		categoryFrcData = categoryFrcData.filter(item => item.assignCategoryFrcId != null)

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