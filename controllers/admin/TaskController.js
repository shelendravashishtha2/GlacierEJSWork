const User = require("../../models/User");
const Property = require("../../models/Property");
const Task = require("../../models/CategoryAssign");
const Category = require("../../models/CategoryMaster");
const fs = require('fs')
const path = require('path');
const bcrypt = require("bcryptjs");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { errorLog } = require("../../helper/consoleLog");
const PropertyResource = require('../resources/PropertyResource');
const Joi = require("joi");

// Create Task Page
exports.taskList = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Assign Task List', session: req.session };

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		
		// let limit = { $limit : 10};
		// let skip = { $skip : (page - 1) * 10};
		// let group = {
		// 	$group:{
		// 		_id:"$_id",
		// 		propertyId:{$first:"$property._id"},
		// 		property_name:{$first:"$property.property_name"},
		// 		category_name:{$first:"$categories.category_name"},
		// 		createdAt:{$first:"$property.createdAt"}
		// 	}
		// }
		// let lookup = {
		// 	$lookup: {
		//         from: 'properties',
		//         let: {
		//             id: "$propertyId"
		//         },
		//         pipeline: [{
		//                 $match: {
		//                     $expr: {
		//                         $and: [{
		//                                 $eq: ["$_id", "$$id"]
		//                             }/*,
		//                             {
		//                                 $eq: [false, "$$isDeleted"]
		//                             }*/
		//                         ]
		//                     }
		//                 }
		//             },
		//             {
		//                 $project: {
		//                     _id:1,
		//                     property_name: 1
		//                 }
		//             }
		//         ],
		//         as: 'property',
		//     }
		// }

		// let unwind = {
		//     $unwind: {
		//         path: "$property",
		//         preserveNullAndEmptyArrays: true
		//     }
		// }
		// let lookup1 = {
		// 	$lookup: {
		//         from: 'categories',
		//         let: {
		//             id: "$categoryId"
		//         },
		//         pipeline: [{
		//                 $match: {
		//                     $expr: {
		//                         $and: [{
		//                                 $eq: ["$_id", "$$id"]
		//                             }/*,
		//                             {
		//                                 $eq: [false, "$$isDeleted"]
		//                             }*/
		//                         ]
		//                     }
		//                 }
		//             },
		//             {
		//                 $project: {
		//                     _id:1,
		//                     category_name: 1
		//                 }
		//             }
		//         ],
		//         as: 'categories',
		//     }
		// }

		// let unwind1 = {
		//     $unwind: {
		//         path: "$categories",
		//         preserveNullAndEmptyArrays: true
		//     }
		// }

		// let query1 = {};
		// if(req.query.search){
		// 	query1['property_name'] = {$regex: new RegExp(req.query.search, 'i')};
		// }
		// let search = {"$match": {$or: [query1]}};
		// let sort = {
		//     $sort:{
		//         createdAt:-1
		//     }
		// };
		// let totalProperty = await Task.count({});
		// totalPage = Math.ceil(totalProperty/10);
		// let propertyData = await Task.aggregate([lookup,unwind,lookup1,unwind1,group,search,sort,skip,limit]);

		let propertyIds = await Task.find({}).populate({ path: 'propertyId', model: 'Property' }).distinct("propertyId");
		let propertyData = await Property.find({ _id: { $in: propertyIds } })

		return res.render('Admin/Task/index', {
			data: propertyData,
			page: 1,
			totalPage: 1,
			search: req.query.search ? req.query.search : "",
			message: req.query.message ? req.query.message : ""
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// Task List Page
exports.propertyUser = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
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
		let assignOperationTeam = await Task.find({ propertyId: req.query.propertyId }).distinct("operationTeamId");
		let usedCategory = await Task.distinct("categoryId", { propertyId: req.query.propertyId });
		let assignedCategory = await Category.find({ _id: { $in: usedCategory }, status: 1 });
		let allCategory = await Category.find({ status: 1 });

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

exports.createTaskSubmit = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			propertyId: Joi.required(),
			categoryId: Joi.required(),
			operationTeamId: Joi.required(),
			managerId: Joi.optional(),
			supervisorId: Joi.optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		for (let i = 0; i < req.body.categoryId.length; i++) {
			let alreadyExists = await Task.exists({ propertyId: req.body.propertyId, categoryId: req.body.categoryId[i] });
			if (!alreadyExists) {
				await Task.create({
					propertyId: req.body.propertyId,
					categoryId: req.body.categoryId[i],
					operationTeamId: req.body.operationTeamId,
				})
			} else {
				await Task.updateOne({ propertyId: req.body.propertyId, categoryId: req.body.categoryId[i] }, {
					operationTeamId: req.body.operationTeamId,
				})
			}

		}
		return res.redirect("/task?message=Task Assign Successfully");

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

exports.createTask = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Task List', session: req.session };

		let taskData = await Task.distinct("propertyId", {});
		let query = {};
		if(taskData.length > 0){
			query = {_id: {$nin: taskData}}
		}
		let propertyData = await Property.find(query, { property_name: 1 });
		let allCategory = await Category.find({ "status": 1 }, { category_name: 1 })
		return res.render('Admin/Task/create', { data: propertyData, allCategory: allCategory });

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// Edit Task Page
exports.updateTaskSubmit = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Task List', session: req.session };

		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			propertyId: Joi.required(),
			categoryId: Joi.required(),
			operationTeamId: Joi.required(),
			managerId: Joi.optional(),
			supervisorId: Joi.optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		for (let i = 0; i < req.body.categoryId.length; i++) {
			let alreadyExists = await Task.exists({ propertyId: req.body.propertyId, categoryId: req.body.categoryId[i] });
			if (!alreadyExists) {
				await Task.create({
					propertyId: req.body.propertyId,
					categoryId: req.body.categoryId[i],
					operationTeamId: req.body.operationTeamId,
				})
			} else {
				await Task.updateOne({ propertyId: req.body.propertyId, categoryId: req.body.categoryId[i] }, {
					operationTeamId: req.body.operationTeamId,
				})
			}

		}
		return res.redirect("/task?message=Task Assign Successfully");

		// let schema = Joi.object({
		// 	taskId: Joi.required(),
		// 	categoryId: Joi.required(),
		// 	operationTeamId: Joi.required(),
		// 	managerId: Joi.optional(),
		// 	supervisorId: Joi.optional(),
		// });
		// let validation = schema.validate(req.body, __joiOptions);
		// if (validation.error) {
		// 	return res.send(response.error(400, validation.error.details[0].message, [] ));
		// }

		// let taskData = await Task.updateOne({_id:req.body.taskId},{
		// 	categoryId: req.body.categoryId?req.body.categoryId:[],
		// 	operationTeamId: req.body.operationTeamId?req.body.operationTeamId:[],
		// 	managerId: req.body.managerId?req.body.managerId:[],
		// 	supervisorId: req.body.supervisorId?req.body.supervisorId:[],

		// })
		// return res.redirect("/edit-task/"+req.body.taskId+"?message=Task Updated Successfully")

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}
exports.editTask = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Edit Task', session: req.session };

		let taskData = await Task.findOne({ propertyId: req.params.id });
		if (!taskData) {
			return res.redirect('/task');
		}

		let propertyData = await Property.findOne({ _id: req.params.id }, { property_name: 1 });
		if (!propertyData) {
			return res.redirect('/task');
		}

		let allCategory = await Category.find({ "status": 1 }, { category_name: 1 });
		let assignCategory = await Task.find({ propertyId: req.params.id });

		allCategory = JSON.parse(JSON.stringify(allCategory));

		for (let i = 0; i < allCategory.length; i++) {
			const allCategoryData = allCategory[i];
			let status = false;
			for (let j = 0; j < assignCategory.length; j++) {
				const assignCategoryData = assignCategory[j];
				if (String(allCategoryData._id) == String(assignCategoryData.categoryId)) {
					status = true;
				}
			}
			allCategory[i].status = status;
		}

		let allOperationTeam = await User.find({ "position_id": 2 }, { _id: 1, full_name: 1 }).lean();
		let assignOperationTeam = await Task.find({ propertyId: req.params.id }).distinct("operationTeamId");

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
exports.viewTask = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'View Task', session: req.session };

		let property = await Property.findOne({ _id: req.params.id }, { property_name: 1 });
		let categoryIds = await Task.find({ propertyId: req.params.id }).distinct("categoryId");
		let categoryData = await Category.find({_id: {$in: categoryIds}});

		let operationTeamIds = await Task.find({propertyId: req.params.id}).distinct("operationTeamId");
		let operationTeams = await User.find({_id: {$in: operationTeamIds}});

		let managerIds = await Task.find({propertyId: req.params.id}).distinct("managerId");
		let managers = await User.find({_id: {$in: managerIds}});

		let supervisorIds = await Task.find({propertyId: req.params.id}).distinct("supervisorId");
		let supervisors = await User.find({_id: {$in: supervisorIds}});

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