const { assert } = require("console");
const { Validator } = require('node-input-validator');
const fs = require('fs')
const path = require('path');
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require("joi");
const User = require("../../../models/User");
const Property = require("../../../models/Property");
const CategoryAssign = require("../../../models/CategoryAssign");
const CategoryMaster = require("../../../models/CategoryMaster");
const response = require("../../../helper/response");
const { errorLog } = require("../../../helper/consoleLog");
const CategoryFrcMaster = require("../../../models/CategoryFrcMaster");
const CategoryFrcAssign = require("../../../models/CategoryFrcAssign");
const { capitalizeFirstLetter } = require("../../../helper/commonHelpers");

// Create Task Page
exports.categoryAssignment = async (req, res) => {
	try {
		res.locals.title = 'Assign Task List';
		res.locals.session = req.session;

		let propertyIds = await CategoryAssign.distinct('propertyId');

		let findQuery = { _id: { $in: propertyIds }, status: 1 }
		if (req.query.search) {
			findQuery.property_name = { $regex: new RegExp(req.query.search, 'i') }
		}

		const options = {
			page: req.query.page ? Math.max(1, req.query.page) : 1,
			limit: 10
		};

		let propertyData = await Property.paginate(findQuery, options);

		return res.render('Admin/Task/index', {
			propertyData: propertyData,
			search: req.query.search ? req.query.search : "",
			message: req.flash('success_msg'),
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// Task List Page
exports.propertyCategoryList = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.required()
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let propertyData = await Property.findOne({ _id: req.query.propertyId }, { property_name: 1 });
		if (!propertyData) {
			return res.status(200).send({
				"status": false,
				"status_code": "200"
			});
		}

		let allOperationTeam = await User.find({ "position_id": 2 }, { full_name: 1 })
		let assignOperationTeam = await CategoryAssign.find({ propertyId: req.query.propertyId }).distinct("operationTeamId");
		let usedCategory = await CategoryAssign.distinct("categoryId", { propertyId: req.query.propertyId });
		let assignedCategory = await CategoryMaster.find({ _id: { $in: usedCategory }, status: 1 });
		let allCategory = await CategoryMaster.find({ status: 1 });

		return res.status(200).send({
			"status": true,
			allCategory: allCategory,
			assignedCategory: assignedCategory,
			allOperationTeam: allOperationTeam,
			assignOperationTeam: assignOperationTeam,
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

exports.assignCategorySubmit = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.required(),
			categoryId: Joi.required(),
			operationTeamId: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, categoryId, operationTeamId } = req.body;
		for (let i = 0; i < req.body.categoryId.length; i++) {
			let created = await CategoryAssign.create({
				propertyId: req.body.propertyId,
				categoryId: req.body.categoryId[i],
				operationTeamId: req.body.operationTeamId,
			})
			let categoryFrc = await CategoryFrcMaster.find({ categoryId: req.body.categoryId[i] });
			let frcAssigns = []
			categoryFrc.map((item) => {
				frcAssigns.push({
					propertyId: propertyId,
					assignCategoryId: created._id,
					checklist_id: item.checklist_id,
					checklist_name: item.checklist_name,
					type: item.type,
					form: item.form,
					frequency: item.frequency,
					month: item.month,
					date: item.date,
					day: capitalizeFirstLetter(item.day)
				})
			})
			await CategoryFrcAssign.insertMany(frcAssigns);
		}
		// return res.redirect(req.baseUrl+'/category-assignment?message=Task Assign Successfully');
		return res.redirect(req.baseUrl + '/category-assignment');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

exports.assignCategory = async (req, res) => {
	try {
		res.locals.title = 'Task List';
		res.locals.session = req.session;

		let taskData = await CategoryAssign.distinct("propertyId", {});
		let query = {};
		if (taskData.length > 0) {
			query = { _id: { $nin: taskData } }
		}
		let propertyData = await Property.find(query, { property_name: 1 });
		let allCategory = await CategoryMaster.find({ "status": 1 }, { category_name: 1 });

		return res.render('Admin/Task/create', { data: propertyData, allCategory: allCategory });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// Edit Task Page
exports.updateAssignCategory = async (req, res) => {
	try {
		res.locals.title = 'Task List';
		res.locals.session = req.session;
		const validate = new Validator(req.body, {
			propertyId: 'required',
		});
		const matched = await validate.check();
		let errors = {propertyId:{},operationTeamId:{}} 
		if (!matched) {
			errors.propertId = {errMsg: 'Please select property name'}
		} else if(req.body.categoryId.length > 0 && req.body.operationTeamId===undefined) {
			errors.operationTeamId = {errMsg: 'Please select operation team(s)'};
		}
		console.log(errors);
		console.log(req.body.categoryId.length);
		console.log(req.body.operationTeamId);
		console.log(req.body.categoryId);
		if(Object.keys(errors.propertyId).length > 0 || Object.keys(errors.operationTeamId).length > 0){
			req.session.errors = errors;
			return res.redirect('back');
		}
		// let schema = Joi.object({
		// 	propertyId: Joi.required(),
		// 	categoryId: Joi.optional(),
		// 	operationTeamId: Joi.when('categoryId',{
		// 		is: Joi.exist(),
		// 		then: Joi.required(),
		// 		otherwise: Joi.optional()
		// 	})
		// });
		// __joiOptions.abortEarly= false;
		// let validation = schema.validate(req.body, __joiOptions);
		// if (validation.error) {
		// 	console.log(validation.error.details[0], 'Validation errors');
		// 	let errors = {}
		// 	if(validation.error.details.length > 0){
		// 		if(validation.error.details[0].path[0] === 'operationTeamId'){
		// 			errors.errMsg = validation.error.details[0].message;
		// 			errors.inputData = req.body;
		// 		}else{

		// 		}
		// 	}
		// 	req.session.error = {};
		// 	return res.redirect('back');
		// }
		
		let { propertyId, categoryId, operationTeamId } = req.body;
		await CategoryAssign.updateMany({ propertyId: req.body.propertyId }, { deleted: 0 });
		await CategoryFrcAssign.updateMany({ propertyId: req.body.propertyId }, { deleted: 1 });
		for (let i = 0; i < req.body.categoryId.length; i++) {
			let alreadyExists = await CategoryAssign.exists({ propertyId: req.body.propertyId, categoryId: categoryId[i] });
			if (!alreadyExists) {
				await CategoryAssign.create({
					propertyId: req.body.propertyId,
					categoryId: req.body.categoryId[i],
					operationTeamId: req.body.operationTeamId,
				})
				let categoryFrc = await CategoryFrcMaster.find({ categoryId: categoryId[i] });
				let frcAssigns = []
				categoryFrc.map((item) => {
					frcAssigns.push({
						propertyId: propertyId,
						assignCategoryId: created._id,
						checklist_id: item.checklist_id,
						checklist_name: item.checklist_name,
						type: item.type,
						form: item.form,
						frequency: item.frequency,
						month: item.month,
						date: item.date,
						day: capitalizeFirstLetter(item.day)
					})
				})
				await CategoryFrcAssign.insertMany(frcAssigns);
			} else {
				let assignCategory = await CategoryAssign.findOneAndUpdate({ propertyId: propertyId, categoryId: categoryId[i] }, {
					operationTeamId: req.body.operationTeamId,
					deleted: 1
				}, { new: true, runValidators: true });

				let categoryFrc = await CategoryFrcMaster.find({ categoryId: categoryId[i] });
				let frcAssigns = [];
				for (let j = 0; j < categoryFrc.length; j++) {
					let item = categoryFrc[j];
					let categoryFrcAssignExists = await CategoryFrcAssign.exists({ propertyId: propertyId, assignCategoryId: assignCategory._id, checklist_id: item.checklist_id });
					if (!categoryFrcAssignExists) {
						frcAssigns.push({
							propertyId: propertyId,
							assignCategoryId: assignCategory._id,
							checklist_id: item.checklist_id,
							checklist_name: item.checklist_name,
							type: item.type,
							form: item.form,
							frequency: capitalizeFirstLetter(item.frequency),
							month: item.month,
							date: item.date,
							day: capitalizeFirstLetter(item.day)
						})
					} else {
						await CategoryFrcAssign.updateOne({ propertyId: propertyId, checklist_id: item.checklist_id, assignCategoryId: assignCategory._id }, { deleted: 0 });
					}
				}
				if (frcAssigns.length > 0) {
					await CategoryFrcAssign.insertMany(frcAssigns);
				}

			}

		}
		req.flash('success_msg', 'Task Assign Successfully');
		return res.redirect(req.baseUrl + '/category-assignment');

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}
exports.editAssignCategory = async (req, res) => {
	try {
		res.locals.title = 'Edit Task';
		res.locals.session = req.session;

		let taskData = await CategoryAssign.findOne({ propertyId: req.params.id });
		if (!taskData) {
			return res.redirect(req.baseUrl + '/category-assignment');
		}

		let propertyData = await Property.findOne({ _id: req.params.id }, { property_name: 1 });
		if (!propertyData) {
			return res.redirect(req.baseUrl + '/category-assignment');
		}

		let allCategory = await CategoryMaster.find({ "status": 1 }, { category_name: 1 }).lean();
		let assignCategory = await CategoryAssign.find({ propertyId: req.params.id });

		for (let i = 0; i < allCategory.length; i++) {
			const allCategoryData = allCategory[i];
			let status = false;
			for (let j = 0; j < assignCategory.length; j++) {
				const assignCategoryData = assignCategory[j];
				if (String(allCategoryData._id) == String(assignCategoryData.categoryId) && assignCategoryData.status == 1) {
					status = true;
				}
			}
			allCategory[i].status = status;
		}

		let allOperationTeam = await User.find({ "position_id": 2 }, { _id: 1, full_name: 1 }).lean();
		let assignOperationTeam = await CategoryAssign.find({ propertyId: req.params.id }).distinct("operationTeamId");

		for (let i = 0; i < allOperationTeam.length; i++) {
			const allOperationTeamData = allOperationTeam[i];
			let status = false;
			for (let j = 0; j < assignOperationTeam.length; j++) {
				const assignOperationTeamData = assignOperationTeam[j];
				if (String(allOperationTeamData._id) == String(assignOperationTeamData)) {
					status = true;
				}
			}
			allOperationTeam[i].status = status;
		}

		return res.render('Admin/Task/edit', {
			propertyData: propertyData,
			allCategory: allCategory,
			allOperationTeam: allOperationTeam,
			assignOperationTeam: assignOperationTeam,
			message: req.query.message ? req.query.message : ""
		});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// Vew Task Page
exports.viewPropertyAssignCategory = async (req, res) => {
	try {
		res.locals.title = 'View Task';
		res.locals.session = req.session;

		let property = await Property.findOne({ _id: req.params.id }, { property_name: 1 });
		let categoryIds = await CategoryAssign.find({ propertyId: req.params.id }).distinct("categoryId");
		let categoryData = await CategoryMaster.find({ _id: { $in: categoryIds } });

		let operationTeamIds = await CategoryAssign.find({ propertyId: req.params.id }).distinct("operationTeamId");
		let operationTeams = await User.find({ _id: { $in: operationTeamIds } });

		let managerIds = await CategoryAssign.find({ propertyId: req.params.id }).distinct("managerId");
		let managers = await User.find({ _id: { $in: managerIds } });

		let supervisorIds = await CategoryAssign.find({ propertyId: req.params.id }).distinct("supervisorId");
		let supervisors = await User.find({ _id: { $in: supervisorIds } });

		// let operationTeams = [];
		// let supervisors = [];
		// let auditor = [];
		// let categories = [];
		// let managers = [];

		// if (taskData.managerId.length > 0) {
		// 	let manager = await User.find({ _id: { $in: taskData.managerId } }, { full_name: 1 });
		// 	for (let i = 0; i < manager.length; i++) {
		// 		managers.push(manager[i].full_name);
		// 	}
		// }
		// if (taskData.supervisorId.length > 0) {
		// 	let supervisor = await User.find({ _id: { $in: taskData.supervisorId } }, { full_name: 1 });
		// 	for (let i = 0; i < supervisor.length; i++) {
		// 		supervisors.push(supervisor[i].full_name);
		// 	}
		// }
		// let operationTeam = await User.find({ _id: { $in: taskData.operationTeamId } }, { full_name: 1 });
		// for (let i = 0; i < operationTeam.length; i++) {
		// 	operationTeams.push(operationTeam[i].full_name);
		// }
		// for (let i = 0; i < category.length; i++) {
		// 	categories.push(category[i].category_name);
		// }

		return res.render('Admin/Task/view', {
			property_name: property.property_name,
			categoryData: categoryData,
			managers: managers,
			supervisors: supervisors,
			operationTeams: operationTeams,
		})

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}