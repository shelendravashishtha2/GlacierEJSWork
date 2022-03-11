const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { check, sanitizeBody, validationResult, matchedData } = require('express-validator');
const toastr = require('express-toastr');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const User = require("../../../models/User");
const CategoryMaster = require("../../../models/CategoryMaster");
const CategoryFrcMaster = require("../../../models/CategoryFrcMaster");
const Setting = require("../../../models/Setting");
const response = require("../../../helper/response");
const CategoryResource = require('../../api/resources/CategoryResource');
const daysEnum = require("../../../enum/daysEnum");
const frequencyEnum = require("../../../enum/frequencyEnum");
const monthsEnum = require("../../../enum/monthsEnum");

// Category List Page
exports.categoryList = async (req, res) => {
	try {
		res.locals.title = 'Categories';
		res.locals.session = req.session;

		let page = 1;
		if (req.query.page != undefined) {
			page = req.query.page;
		}
		let limit = { $limit: 10 };
		let skip = { $skip: (page - 1) * 10 };
		let project = {
			$project: {
				category_name: 1,
				status: 1
			}
		}
		let query1 = {};
		if (req.query.search) {
			query1['category_name'] = { $regex: new RegExp(req.query.search, 'i') };
		}
		let totalProperty = await CategoryMaster.count(query1);
		totalPage = Math.ceil(totalProperty / 10);

		let search = { "$match": { $or: [query1] } };
		let sort = {
			$sort: {
				createdAt: -1
			}
		};
		let categoryData = await CategoryMaster.aggregate([search, sort, skip, limit, project]);

		return res.render('Admin/Categories/index', {
			req: req,
            data: categoryData,
            page: page,
            totalPage: totalPage,
            search: req.query.search ? req.query.search : '',
            // success: req.flash('success_msg'),
            // error: req.flash('error_msg'),
        })
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Category List Page
exports.changeCategoryStatus = async (req, res) => {
	try {
		let schema = Joi.object({
			_id: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let data = await CategoryMaster.findOne({ _id: req.body._id });
		data.status == 0 ? data.status = 1 : data.status = 0;
		data.save();

		// let data = await CategoryMaster.findOne({ _id: req.body._id });
		// await data.restore();

		// let data1 = await CategoryMaster.findOne({ _id: req.body._id });
		// console.log(data1);

		return res.send(response.success(200, 'Status update Successfully', data.status));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.success(500, 'Something want wrong', []));
	}
}

// Category Create Page
exports.categoryCreate = async (req, res) => {
	try {
		res.locals.title = 'Create Category';
		res.locals.session = req.session;
		res.locals.error = req.session.error ? req.session.error : '';

		let categoryData = await CategoryMaster.find({});

		return res.render('Admin/Categories/create-category', { 'data': CategoryResource(categoryData) });
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.categoryAddValidationForm = [
	// Category name validation
	check('category_name').trim().notEmpty().withMessage('Category name required')
		.isLength({ min: 2 }).withMessage('must be at least 2 chars long')
		.custom(value => {
			return CategoryMaster.findOne({ category_name: value }).then((data) => { if (data) { return Promise.reject('category name already exists') } })
		}),
];

// Category add api
exports.categoryAdd = async (req, res) => {
	try {
		res.locals.title = 'Category Add';
		res.locals.session = req.session;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			let errMsg = errors.mapped();
			req.session.error = { errMsg: errMsg, inputData: req.body };
			req.flash('error_msg', 'Category is not added!');
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		let CategoryData = new CategoryMaster({
			category_name: req.body.category_name,
		});
		await CategoryData.save();
		
		req.flash('success_msg', 'Category is added!');
		return res.redirect(req.baseUrl+'/categories');
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error_msg', errorMessage.message);
			return res.redirect(req.baseUrl+'/categories');
		} else {
			errorLog(error, __filename, req.originalUrl);
			req.flash('error_msg', 'Something want wrong');
			return res.redirect(req.baseUrl+'/categories');
		}
	}
}

// Checklist Multi Form
exports.checklistMultiForm = async (req, res) => {
	try {
		res.locals.title = 'Checklist Multi Form';
		res.locals.session = req.session;

		let categoryData = await CategoryMaster.find({});
		return res.render('Admin/Categories/checklist-multi-form', { 'data': CategoryResource(categoryData) });
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Edit Check List Multi Form
exports.editChecklistForm = async (req, res) => {
	try {
		res.locals.title = 'Edit Checklist Multi Form';
		res.locals.session = req.session;

		let categoryData = await CategoryMaster.find({});

		return res.render('Admin/Categories/edit-checklist-multi-form', { 'data': CategoryResource(categoryData) });
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Category Add Checklist Page
exports.createChecklist = async (req, res) => {
	try {
		res.locals.title = 'Add Check List Category';
		res.locals.session = req.session;

		console.log('controller>>>>>',res.locals);

		let setting = await Setting.findOne({});
		let uniqueId = 0;
		if (!setting) {
			let setting = await Setting.create({
				uniqueId: 1,
			})
			uniqueId = 1;
		} else {
			uniqueId = setting.uniqueId;
		}
		uniqueId = uniqueId.toString().padStart(8, "0");

		let condition = { "$match": { status: 1 } };

		let project = {
			$project: {
				category_name: 1,
			}
		}
		let categoryData = await CategoryMaster.aggregate([condition, project]);

		let daysArr = Object.keys(daysEnum);
		let frequencyArr = Object.keys(frequencyEnum);
		let monthsArr = Object.keys(monthsEnum);

		return res.render('Admin/Categories/create-check-list', { 
			months: monthsArr, 
			uniqueId: uniqueId, 
			category_id: req.params.id, 
			categoryData: categoryData,
			daysArr: daysArr,
			frequencyArr: frequencyArr
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.addChecklistAValidation = [
	check('category_id').trim().notEmpty().withMessage('category id required').isMongoId().withMessage('category id is not valid'),
	check('checklist_name').trim().notEmpty().withMessage('Checklist Id required')
		.isLength({ min: 3 }).withMessage('must be at least 5 chars long'),
	check('type').trim().notEmpty().withMessage('Type is required'),
	check('frequency').trim().notEmpty().withMessage('Frequency is required')
];

// Category store Checklist
exports.storeChecklist = async (req, res) => {
	try {
		res.locals.title = 'Store category wise checklist details';
		res.locals.session = req.session;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			let errMsg = errors.mapped();
			req.session.error = { errMsg: errMsg, inputData: req.body };
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		const alreadyExistsId = await CategoryFrcMaster.findOne({checklist_id: req.body.checklist_id})
		if (alreadyExistsId) {
			console.log('alreadyExistsId');
			let errMsg = "already Exists Checklist Id";
			req.session.error = { errMsg: errMsg, inputData: req.body };
			req.flash('error_msg', 'Checklist Id already Exists!---->>>>>');
			return res.redirect('back');
		}

		// let setting = await Setting.findOne({});
		// let uniqueId = 0;
		// if (!setting) {
		// 	let setting = await Setting.create({
		// 		uniqueId: 1,
		// 	})
		// 	uniqueId = 1;
		// } else {
		// 	uniqueId = setting.uniqueId;
		// 	setting.uniqueId = setting.uniqueId + 1;
		// 	setting.save();
		// }
		// uniqueId = uniqueId.toString().padStart(8, "0");

		const CategoryChecklistData = new CategoryFrcMaster({
			category_id: req.body.category_id,
			checklist_id: req.body.checklist_id,
			checklist_name: req.body.checklist_name,
			type: req.body.type,
			frequency: req.body.frequency,
			day: req.body.day ? req.body.day : null,
			month: req.body.month ? req.body.month : null,
			date: req.body.date ? req.body.date : null,
		});
		await CategoryChecklistData.save();

		return res.redirect(req.baseUrl+'/create-checklist-multi-form/' + CategoryChecklistData._id);
	} catch (error) {
		let errorMessage = '';
		if (error.name == "ValidationError") {
			errorMessage = error.errors[Object.keys(error.errors)[0]];
			errorMessage = errorMessage.message;
		} else {
			errorLog(error, __filename, req.originalUrl);
			errorMessage = "Something want wrong";
		}
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// Category Checklist Page 
exports.checklist = async (req, res) => {
	try {
		res.locals.title = 'Edit Category Checklist';
		res.locals.session = req.session;

		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		let CategoryData = await CategoryMaster.findOne({ _id: req.params.id });
		let CategoryChecklistData = await CategoryFrcMaster.find({ category_id: req.params.id });

		return res.render('Admin/Categories/edit-category-checklist', { data: CategoryChecklistData, CategoryData: CategoryData, 'success': req.flash('success_msg'), 'error': req.flash('error_msg') });
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Master FRC Checklist : 
exports.frcChecklist = async (req, res) => {
	try {
		res.locals.title = 'Master FRC Checklist';
		res.locals.session = req.session;

		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		// let condition = { "$match": { status: 1 } };
		// let lookup = {
		// 	$lookup: {
		// 		from: 'categories',
		// 		let: {
		// 			id: "$category_id"
		// 		},
		// 		pipeline: [{
		// 			$match: {
		// 				$expr: {
		// 					$and: [{
		// 						$eq: ["$_id", "$$id"]
		// 					}/*,
        //                             {
        //                                 $eq: [false, "$$isDeleted"]
        //                             }*/
		// 					]
		// 				}
		// 			}
		// 		},
		// 		{
		// 			$project: {
		// 				_id: 1,
		// 				category_name: 1
		// 			}
		// 		}
		// 		],
		// 		as: 'categories',
		// 	}
		// }

		// let unwind = {
		// 	$unwind: {
		// 		path: "$categories",
		// 		preserveNullAndEmptyArrays: true
		// 	}
		// }

		// let project = {
		// 	$project: {
		// 		checklist_id: 1,
		// 		checklist_name: 1,
		// 		type: 1,
		// 		status: 1,
		// 		category_id: "$categories._id",
		// 		category_name: "$categories.category_name",
		// 		frequency: 1,
		// 	}
		// }

		// let query1 = {};
		// if (req.query.search) {
		// 	query1['category_id'] = require('mongoose').Types.ObjectId(req.query.search);
		// }
		// let search = { "$match": { $or: [query1] } };

		// let CategoryChecklistData = await CategoryFrcMaster.aggregate([search, condition, lookup, unwind, project])
		// let categoryData = await CategoryMaster.aggregate([condition]);

		let paramsCategoryId = req.query.search;

		let allCategoryData = await CategoryMaster.find({status: 1});

		let findQuery = { status: 1 }
		if (req.query.search) {
			findQuery.category_id = req.query.search
		}

		let CategoryChecklistData = await CategoryFrcMaster.find(findQuery).populate({path: 'category_id'}).sort({createdAt: 'desc'});

		return res.render('Admin/Categories/master-frc-checklist', {
            data: CategoryChecklistData,
            categoryData: allCategoryData,
            paramsCategoryId: paramsCategoryId,
            success: req.flash('success_msg'),
            error: req.flash('error_msg'),
        })
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Category List Page
exports.changeChecklistStatus = async (req, res) => {
	try {
		let schema = Joi.object({
			_id: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let data = await CategoryFrcMaster.findOne({ _id: req.body._id });
		data.status == 0 ? data.status = 1 : data.status = 0;
		data.save();

		return res.send(response.success(200, 'Status update Successfully', data.status));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.success(500, 'Something want wrong', []));
	}
}

// Update Category store
exports.updateCategory = async (req, res) => {
	try {
		let CategoryData = await CategoryMaster.findOne({ category_name: req.body.category_name });
		if (!CategoryData) {
			let CategoryData = await CategoryMaster.updateOne({ _id: req.body.category_id }, { category_name: req.body.category_name });
		} else {
			req.flash('error_msg', 'Category name already exists!');
			return res.redirect('back');
		}
		req.flash('success_msg', 'Category is updated!');
		return res.redirect(req.baseUrl+'/edit-category-checklist/' + req.body.category_id);
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		req.flash('error_msg', 'Something want wrong');
		return res.redirect('back');
	}
}

// Edit Checklist page
exports.editChecklistDetails = async (req, res) => {
	try {
		res.locals.title = 'Edit checklist page';
		res.locals.session = req.session;

		let CategoryChecklistData = await CategoryFrcMaster.findOne({ _id: req.params.id });

		let daysArr = Object.keys(daysEnum);
		let frequencyArr = Object.keys(frequencyEnum);
		let monthsArr = Object.keys(monthsEnum);

		return res.render('Admin/Categories/edit-check-list', {
            data: CategoryChecklistData,
            months: monthsArr,
			daysArr: daysArr,
			frequencyArr: frequencyArr,
            success: req.flash('success_msg'),
            error: req.flash('error_msg'),
        })
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}


exports.updateChecklistValidation = [
	check('checklist_name').trim().notEmpty().withMessage('Checklist Id required')
		.isLength({ min: 3 }).withMessage('must be at least 5 chars long'),
	check('frequency').trim().notEmpty().withMessage('Frequency is required')
];

// Update Category store
exports.updateChecklistDetails = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			let errMsg = errors.mapped();
			req.session.error = { errMsg: errMsg, inputData: req.body };
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		let CategoryChecklistData = await CategoryFrcMaster.findOneAndUpdate({ _id: req.body._id }, {
			checklist_id: req.body.checklist_id,
			checklist_name: req.body.checklist_name,
			frequency: req.body.frequency,
			day: req.body.day,
			month: req.body.month,
			date: req.body.date,
		}, {new:true,runValidators:true});
		
		req.flash('success_msg', 'Category checklist is updated!');
		return res.redirect(req.baseUrl+'/master-frc');
	} catch (error) {
		let errorMessage = '';
		if (error.name == "ValidationError") {
			errorMessage = error.errors[Object.keys(error.errors)[0]];
			errorMessage = errorMessage.message;
		} else {
			errorLog(error, __filename, req.originalUrl);
			errorMessage = "Something want wrong";
		}
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// Edit Checklist page
exports.updateFormCreate = async (req, res) => {
	try {
		let schema = Joi.object({
			checklistId: Joi.required(),
			forms: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let categoryChecklistData = await CategoryFrcMaster.findOne({ _id: req.body.checklistId });
		categoryChecklistData.form = req.body.forms;
		await categoryChecklistData.save();

		return res.send(response.success(200, 'Form update Successfully'));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.createChecklistMultiForm = async (req, res) => {
	try {
		res.locals.title = 'Create Checklist Form';
		res.locals.session = req.session;

		let CategoryChecklistData = await CategoryFrcMaster.findOne({ _id: req.params.id }).populate({ path: 'category_id' });

		return res.render('Admin/Categories/edit-checklist-multi-form', { data: CategoryChecklistData });
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.viewChecklistMultiForm = async (req, res) => {
	try {
		res.locals.title = 'View Checklist Form';
		res.locals.session = req.session;

		let CategoryChecklistData = await CategoryFrcMaster.findOne({ _id: req.params.id }).populate({ path: 'category_id' });

		return res.render('Admin/Categories/view-checklist-multi-form', { data: CategoryChecklistData });
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}