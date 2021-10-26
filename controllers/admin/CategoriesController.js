const User = require("../../models/User");
const Category = require("../../models/Category");
const CategoryCheckList = require("../../models/CategoryCheckList");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {errorLog} = require("../../helper/consoleLog");
const CategoryResource = require('../resources/CategoryResource');
const { check,sanitizeBody,validationResult,matchedData } = require('express-validator');
const Joi = require("joi");

exports.categoryAddValidationForm=[
	// Category name validation
	check('category_name').trim().notEmpty().withMessage('Category name required').isLength({ min: 3 })
	.withMessage('must be at least 5 chars long'),
];

exports.checkListAddValidationForm=[
	// Category name validation
	check('checklist_name').trim().notEmpty().withMessage('Checklist Id required').isLength({ min: 3 })
	.withMessage('must be at least 5 chars long'),
	// Type
	check('type').trim().notEmpty().withMessage('Type is required'),
	check('frequency').trim().notEmpty().withMessage('Frequency is required'),
	check('month').trim().notEmpty().withMessage('Month is required'),
	check('date').trim().notEmpty().withMessage('Date is required')
];

// Category add api
exports.categoryAdd = async (req, res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Category Add' ,session: req.session};

		const existsUser = await Category.findOne({ category_name: req.body.category_name });
		const errors= validationResult(req);
        if(!errors.isEmpty()){
			var errMsg= errors.mapped();
			var inputData = matchedData(req);
			res.render('Admin/Categories/create-category', {errors:errMsg, inputData:inputData});
         }else{
			if(existsUser) {
				var errMsg= errors.mapped();
				var inputData = matchedData(req);
				res.render('Admin/Categories/create-category', {errors:errMsg, inputData:inputData});
			}else{
				var inputData = matchedData(req); 
				const obj = new Category({
					category_name: req.body.category_name,
				});
				const CategoryData = await obj.save();
				return res.redirect('create-category-checklist/'+CategoryData._id);
			}
		 }
	} catch (error) {
		if (error.name == "ValidationError") {
			// validatation error
		} else {
			errorLog(__filename, req.originalUrl, error);
		}
		const errors= validationResult(req);
		var errMsg= errors.mapped();
		var inputData = matchedData(req);
		res.render('Admin/Categories/create-category', {errors:errMsg, inputData:inputData});
	}
}
// Category Add CheckList

// Category List Page
exports.categoryList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Categories',session: req.session};
		let categoryData = await Category.find({});
		return res.render('Admin/Categories/index',{'data':CategoryResource(categoryData)});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Category Create Page
exports.categoryCreate = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Create Category',session: req.session};
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

		let monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		return res.render('Admin/Categories/create-check-list',{'months':monthsList, category_id: req.params.id});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Category store Checklist
exports.storeChecklist = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Add Check List Category',session: req.session};
		let monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		const errors= validationResult(req);
        if(!errors.isEmpty()){
			var errMsg= errors.mapped();
			var inputData = matchedData(req);
			return res.render('Admin/Categories/create-check-list',{'months':monthsList, category_id: req.body.category_id,errors:errMsg, inputData:inputData});
         }else{
			var inputData = matchedData(req); 
			const CategoryCheckListData = new CategoryCheckList({
				category_id: req.body.category_id,
				checklist_id: req.body.checklist_id,
				checklist_name: req.body.checklist_name,
				type: req.body.type,
				frequency: req.body.frequency,
				month: req.body.month,
				date: req.body.date,
			});
			await CategoryCheckListData.save();
			return res.redirect('create-checklist-form/'+CategoryCheckListData._id);
		 }
		
	} catch (error) {
		res.locals = { title: 'Add Check List Category',session: req.session};
		let monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		if (error.name == "ValidationError") {
			
			errorLog(__filename, req.originalUrl, error);
		} else {
			errorLog(__filename, req.originalUrl, error);
		}
		const errors= validationResult(req);
		var errMsg= errors.mapped();
		var inputData = matchedData(req);
		return res.render('Admin/Categories/create-check-list',{'months':monthsList, category_id: req.body.category_id,errors:errMsg, inputData:inputData});
	}
}

// Category CheckList Page 
exports.checkList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Update Category',session: req.session};

		let CategoryData = await Category.findOne({_id: req.params.id});
		let CategoryCheckListData = await CategoryCheckList.find({category_id: req.params.id});

		return res.render('Admin/Categories/edit-category-checklist',{ data: CategoryCheckListData, CategoryData: CategoryData});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Update Category store
exports.updateCategory = async (req,res) => {
	try {
		let CategoryData = await Category.updateOne({_id: req.body.category_id}, {category_name: req.body.category_name});

		return res.redirect('edit-category-checklist/'+req.body.category_id);
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Edit Checklist page
exports.editChecklistDetails = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Update Category',session: req.session};

		let CategoryCheckListData = await CategoryCheckList.findOne({_id: req.params.id});
		let monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		return res.render('Admin/Categories/edit-check-list',{ data: CategoryCheckListData, months: monthsList });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Update Category store
exports.updateChecklistDetails = async (req,res) => {
	try {
		let CategoryCheckListData = await CategoryCheckList.findOneAndUpdate({_id: req.body._id}, {
			checklist_name: req.body.checklist_name,
			type: req.body.type,
			frequency: req.body.frequency,
			month: req.body.month,
			date: req.body.date,
		},{ new: true });

		return res.redirect('edit-category-checklist/'+CategoryCheckListData.category_id);
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Edit Checklist page
exports.createChecklistForm = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Update Category',session: req.session};

		let CategoryCheckListData = await CategoryCheckList.findOne({_id: req.params.id});

		return res.render('Admin/Categories/edit-checklist-multi-form',{ data: CategoryCheckListData });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}