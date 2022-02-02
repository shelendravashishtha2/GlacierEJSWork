const User = require("../../models/User");
const Category = require("../../models/CategoryMaster");
const CategoryCheckList = require("../../models/CategoryFrcMaster");
const Setting = require("../../models/setting");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {errorLog} = require("../../helper/consoleLog");
const CategoryResource = require('../resources/CategoryResource');
const { check,sanitizeBody,validationResult,matchedData } = require('express-validator');
var toastr = require('express-toastr');
const Joi = require("joi");

exports.categoryAddValidationForm=[
	// Category name validation
	check('category_name').trim().notEmpty().withMessage('Category name required')
		.isLength({ min: 2 }).withMessage('must be at least 2 chars long')
		.custom(value => {
			return Category.findOne({category_name: value}).then((data) => { if (data) {return Promise.reject('category name already exists')} })
		}),
];

// Category add api
exports.categoryAdd = async (req, res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Category Add', session: req.session};

		const errors = validationResult(req);
		if(!errors.isEmpty()){
			let errMsg = errors.mapped();
			req.session.error = {errMsg: errMsg, inputData: req.body};
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		let CategoryData = new Category({
			category_name: req.body.category_name,
		});
		await CategoryData.save();
		req.flash('message', 'Category is added!');
		return res.redirect('categories');
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error', errorMessage.message);
			return res.redirect('categories');
		} else {
			errorLog(__filename, req.originalUrl, error);
			req.flash('error', 'Something want wrong');
			return res.redirect('categories');
		}
	}
}

// Category List Page
exports.categoryList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Categories',session: req.session};

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 10};
		let skip = { $skip : (page - 1) * 10};
		let project = {
			$project:{
				category_name:1,
				status:1
			}
		}
		let query1 = {};
		if(req.query.search){
			query1['category_name'] = {$regex: new RegExp(req.query.search, 'i')};
		}
		let totalProperty = await Category.count(query1);
		totalPage = Math.ceil(totalProperty/10);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                createdAt:-1
            }
		};

		let categoryData = await Category.aggregate([search,sort,skip,limit,project]);

		return res.render('Admin/Categories/index',{'data':categoryData,page:page,totalPage:totalPage,search:req.query.search?req.query.search:"",'message': req.flash('message'), 'error': req.flash('error')});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Category List Page
exports.changeCategoryStatus = async (req,res) => {
	try {
		let schema = Joi.object({
			_id: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let data = await Category.findOne({_id: req.body._id});
		data.status == 0 ? data.status = 1 : data.status = 0;
		data.save();

		return res.send(response.success(200, 'Status update Successfully', data.status));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.success(500, 'Something want wrong', []));
	}
}

// Category Create Page
exports.categoryCreate = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Create Category',session: req.session};
		res.locals.error = req.session.error ? req.session.error : '';
		
		let categoryData = await Category.find({});

		return res.render('Admin/Categories/create-category', {'data':CategoryResource(categoryData)});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Checklist Multi Form
exports.checklistMultiForm = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Checklist Multi Form',session: req.session};
		
		let categoryData = await Category.find({});
		return res.render('Admin/Categories/checklist-multi-form',{'data':CategoryResource(categoryData)});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Edit Check List Multi Form
exports.editCheckListForm = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Edit Checklist Multi Form',session: req.session};
		let categoryData = await Category.find({});
		return res.render('Admin/Categories/edit-checklist-multi-form',{'data':CategoryResource(categoryData)});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Category Add Checklist Page
exports.createCheckList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Add Check List Category',session: req.session};
		let setting = await Setting.findOne({});
		let uniqueId = 0;
		if(!setting){
			let setting = await Setting.create({
				uniqueId: 1,	
			})
			uniqueId = 1;
		}else{
			uniqueId = setting.uniqueId;
		}
		uniqueId = uniqueId.toString().padStart(8, "0");
		let monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		let condition = {"$match": {status:1}};

		let project = {
			$project:{
				category_name:1,
			}
		}
		let categoryData = await Category.aggregate([condition,project]);

		return res.render('Admin/Categories/create-check-list',{'months':monthsList,uniqueId:uniqueId, category_id: req.params.id,categoryData:categoryData});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.addCheckListAValidation=[
	check('category_id').trim().notEmpty().withMessage('category id required').isMongoId().withMessage('category id is not valid'),
	check('checklist_name').trim().notEmpty().withMessage('Checklist Id required')
		.isLength({ min: 3 }).withMessage('must be at least 5 chars long'),
	check('type').trim().notEmpty().withMessage('Type is required'),
	check('frequency').trim().notEmpty().withMessage('Frequency is required')
];

// Category store Checklist
exports.storeChecklist = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Store category wise checklist details',session: req.session};
		
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			let errMsg = errors.mapped();
			req.session.error = {errMsg: errMsg, inputData: req.body};
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		let setting = await Setting.findOne({});
		let uniqueId = 0;
		if(!setting){
			let setting = await Setting.create({
				uniqueId: 1,	
			})
			uniqueId = 1;
		}else{
			uniqueId = setting.uniqueId;
			setting.uniqueId = setting.uniqueId + 1;
			setting.save();
		}
		uniqueId = uniqueId.toString().padStart(8, "0");
		const CategoryCheckListData = new CategoryCheckList({
			category_id: req.body.category_id,
			checklist_id: req.body.checklist_id,
			checklist_name: req.body.checklist_name,
			type: req.body.type,
			frequency: req.body.frequency,
			day: req.body.day?req.body.day:null,
			month: req.body.month?req.body.month:null,
			date: req.body.date?req.body.date:null,
		});
		await CategoryCheckListData.save();
		
		return res.redirect('create-checklist-multi-form/'+CategoryCheckListData._id);
	} catch (error) {
		let errorMessage = '';
		if (error.name == "ValidationError") {
			errorMessage = error.errors[Object.keys(error.errors)[0]];
			errorMessage = errorMessage.message;
		} else {
			errorLog(__filename, req.originalUrl, error);
			errorMessage = "Something want wrong";
		}
		req.session.error = {errorMessage: errorMessage, inputData: req.body};
		return res.redirect('back');
	}
}

// Category CheckList Page 
exports.checkList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Edit Category Checklist',session: req.session};
		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		let CategoryData = await Category.findOne({_id: req.params.id});
		let CategoryCheckListData = await CategoryCheckList.find({category_id: req.params.id});

		return res.render('Admin/Categories/edit-category-checklist',{ data: CategoryCheckListData, CategoryData: CategoryData,'message': req.flash('message'), 'error': req.flash('error')});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Master FRC Checklist : 
exports.frcCheckList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Master FRC Checklist',session: req.session};
		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		let condition = {"$match": {status:1}};
		let lookup = {
        	$lookup: {
                from: 'categories',
                let: {
                    id: "$category_id"
                },
                pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                        $eq: ["$_id", "$$id"]
                                    }/*,
                                    {
                                        $eq: [false, "$$isDeleted"]
                                    }*/
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id:1,
                            category_name: 1
                        }
                    }
                ],
                as: 'categories',
            }
        }

        let unwind = {
            $unwind: {
                path: "$categories",
                preserveNullAndEmptyArrays: true
            }
		}
		
		let project = {
			$project:{
				checklist_id:1,
				checklist_name:1,
				type:1,
				status:1,
				category_id:"$categories._id",
				category_name:"$categories.category_name",
				frequency: 1,
			}
		}

		let query1 = {};
		if(req.query.search){
			query1['category_id'] = require('mongoose').Types.ObjectId(req.query.search);
		}
		let search = {"$match": {$or: [query1]}};
		
		let CategoryCheckListData = await CategoryCheckList.aggregate([search,condition,lookup,unwind,project])
		let categoryData = await Category.aggregate([condition]);

		let paramsCategoryId = req.query.search;

		return res.render('Admin/Categories/master-frc-checklist',{ data: CategoryCheckListData, categoryData: categoryData,paramsCategoryId:paramsCategoryId,'message': req.flash('message'), 'error': req.flash('error')});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Category List Page
exports.changeChecklistStatus = async (req,res) => {
	try {
		let schema = Joi.object({
			_id: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let data = await CategoryCheckList.findOne({_id: req.body._id});
		data.status == 0 ? data.status = 1 : data.status = 0;
		data.save();

		return res.send(response.success(200, 'Status update Successfully', data.status));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.success(500, 'Something want wrong', []));
	}
}

// Update Category store
exports.updateCategory = async (req,res) => {
	try {
		let CategoryData = await Category.findOne({category_name: req.body.category_name});
		if (!CategoryData) {
			let CategoryData = await Category.updateOne({_id: req.body.category_id}, {category_name: req.body.category_name});
		} else {
			req.flash('error', 'Category name already exists!');
			return res.redirect('back');
		}
		req.flash('message', 'Category is updated!');
		return res.redirect('edit-category-checklist/'+req.body.category_id);
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		req.flash('error', 'Something want wrong');
		return res.redirect('back');
	}
}

// Edit Checklist page
exports.editChecklistDetails = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Edit checklist page',session: req.session};

		let CategoryCheckListData = await CategoryCheckList.findOne({_id: req.params.id});
		let monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		return res.render('Admin/Categories/edit-check-list',{ data: CategoryCheckListData, months: monthsList,'message': req.flash('message'), 'error': req.flash('error') });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}


exports.updateChecklistValidation=[
	check('checklist_name').trim().notEmpty().withMessage('Checklist Id required')
		.isLength({ min: 3 }).withMessage('must be at least 5 chars long'),
	check('frequency').trim().notEmpty().withMessage('Frequency is required')
];

// Update Category store
exports.updateChecklistDetails = async (req,res) => {
	try {
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			let errMsg = errors.mapped();
			req.session.error = {errMsg: errMsg, inputData: req.body};
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		let CategoryCheckListData = await CategoryCheckList.findOneAndUpdate({_id: req.body._id}, {
			checklist_id: req.body.checklist_id,
			checklist_name: req.body.checklist_name,
			frequency: req.body.frequency,
			day: req.body.day,
			month: req.body.month,
			date: req.body.date,
		},{ new: true });
		req.flash('message', 'Category checklist is updated!');
		return res.redirect('master-frc');
	} catch (error) {
		let errorMessage = '';
		if (error.name == "ValidationError") {
			errorMessage = error.errors[Object.keys(error.errors)[0]];
			errorMessage = errorMessage.message;
		} else {
			errorLog(__filename, req.originalUrl, error);
			errorMessage = "Something want wrong";
		}
		req.session.error = {errorMessage: errorMessage, inputData: req.body};
		return res.redirect('back');
	}
}

// Edit Checklist page
exports.updateFormCreate = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		let schema = Joi.object({
			checklistId: Joi.required(),
			forms: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let categoryCheckListData = await CategoryCheckList.findOne({_id: req.body.checklistId});
		categoryCheckListData.form = req.body.forms;
		await categoryCheckListData.save();
		return res.send(response.success(200, 'Form update Successfully'));
	} catch (error) {

	}
}
exports.createChecklistMultiForm = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Create Checklist Form',session: req.session};

		let CategoryCheckListData = await CategoryCheckList.findOne({_id: req.params.id}).populate({path: 'category_id'});

		return res.render('Admin/Categories/edit-checklist-multi-form',{ data: CategoryCheckListData });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.viewChecklistMultiForm = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'View Checklist Form',session: req.session};

		let CategoryCheckListData = await CategoryCheckList.findOne({_id: req.params.id}).populate({path: 'category_id'});

		return res.render('Admin/Categories/view-checklist-multi-form',{ data: CategoryCheckListData });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}