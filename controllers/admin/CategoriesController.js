const User = require("../../models/User");
const Category = require("../../models/Category");
const CategoryCheckList = require("../../models/CategoryCheckList");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {errorLog} = require("../../helper/consoleLog");
const CategoryResource = require('../resources/CategoryResource');
const Joi = require("joi");

// Category add form validatation
exports.categoryAddValidation = async (req, res, next) => {
	
	const schema = Joi.object({
		category_name: Joi.string().min(6).max(200).required(),
	});
	const validation = schema.validate(req.body, __joiOptions);
	if (validation.error) {
		return res.send(response.error(400, validation.error.details[0].message, [] ));
	} else {
		next();
	}
}

// Category add api
exports.categoryAdd = async (req, res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Category Add' ,session: req.session};
		
		const existsUser = await Category.findOne({ category_name: req.body.category_name });
		if(existsUser) {
			return res.send(response.error(400, 'Category name already exists', [] ));
        }

		const obj = new Category({
			category_name: req.body.category_name,
		});
		const CategoryData = await obj.save();
		
		return res.redirect('categories');
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(400, errorMessage.message, [] ));
		} else {
			errorLog(__filename, req.originalUrl, error);
			return res.send(response.error(500, 'Something want wrong', [] ));
		}
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

		return res.redirect('edit-category-checklist/'+req.body.category_id);
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(400, errorMessage.message, [] ));
		} else {
			errorLog(__filename, req.originalUrl, error);
			return res.send(response.error(500, 'Something want wrong', [] ));
		}
	}
}

// Category Update Page
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

		return res.render('Admin/Categories/edit-check-list',{ data: CategoryCheckListData, months: monthsList, category_id: req.params.id });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Update Category store
// exports.updateChecklistDetails = async (req,res) => {
// 	try {
// 		let CategoryData = await Category.updateOne({_id: req.body.category_id}, {category_name: req.body.category_name});

// 		return res.redirect('edit-category-checklist/'+req.body.category_id);
// 	} catch (error) {
// 		errorLog(__filename, req.originalUrl, error);
// 		return res.send(response.error(500, 'Something want wrong', []));
// 	}
// }