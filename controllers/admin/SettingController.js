const SettingRating = require("../../models/SettingRating");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {errorLog} = require("../../helper/consoleLog");
const SettingPpmRiskAssessmentColor = require('../../models/SettingPpmRiskAssessmentColor');
const { Validator } = require('node-input-validator');

// Setting Page
exports.settingList = async (req,res) => {
	try {
		res.locals.title = 'Setting';
		res.locals.session = req.session;
		res.locals.errors = req.session.errors ? req.session.errors : '';
		req.session.errors = '';

		let SettingRatingData = await SettingRating.find({});
		let SettingPpmRiskAssessmentColorData = await SettingPpmRiskAssessmentColor.find();

		return res.render('Admin/Setting/index',{ 
			data: SettingRatingData, 
			SettingPpmRiskAssessmentColorData: SettingPpmRiskAssessmentColorData,
			success: req.flash('success_msg'), error: req.flash('error_msg')});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		req.flash('error_msg', 'Something want wrong');
		return res.redirect('back');
	}
}

// Store Rating Setting
exports.storeSetting = async (req,res) => {
	try {
		res.locals.title = 'Setting';
		res.locals.session = req.session;

		await SettingRating.deleteMany();

		for (let i = 0; i < req.body.rating_name.length; i++) {
			await SettingRating.create({
				rating_name: req.body.rating_name[i],
				min_rating: parseFloat(req.body.min_rating[i]).toFixed(2),
				max_rating: parseFloat(req.body.max_rating[i]).toFixed(2),
			});
		}
		req.flash('success_msg', 'Rating is added & updated!');
		return res.redirect(req.baseUrl+'/setting');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		req.flash('error_msg', 'Something want wrong');
		return res.redirect('back');
	}
}

// store Ppm Risk Assessment Color
exports.storePpmRiskAssessmentColor = async (req, res) => {
	try {
		res.locals.title = 'Setting';
		res.locals.session = req.session;

		const validate = new Validator(req.body, {
			color_name: 'required'
		});
		const matched = await validate.check();
		if (!matched) {
			req.session.errors = {errMsg: validate.errors, inputData: req.body};
			return res.redirect('back');
		}		

		const existsData = await SettingPpmRiskAssessmentColor.exists({color_name: req.body.color_name});
		if (!existsData) {
			await SettingPpmRiskAssessmentColor.create({
				color_name: req.body.color_name,
			});
		}

		req.flash('success_msg', 'Add color successfully');
		return res.redirect(req.baseUrl+'/setting');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		req.flash('error_msg', 'Something want wrong');
		return res.redirect('back');
	}
}

// delete Ppm Risk Assessment Color
exports.deletePpmRiskAssessmentColor = async (req, res) => {
	try {
		res.locals.title = 'Setting';
		res.locals.session = req.session;

		const validate = new Validator(req.params, {
			id: 'required'
		});
		const matched = await validate.check();
		if (!matched) {
			req.session.errors = {errMsg: validate.errors, inputData: req.body};
			return res.redirect('back');
		}		

		const existsData = await SettingPpmRiskAssessmentColor.exists({_id: req.params.id});
		if (!existsData) {
			req.flash('error_msg', 'color not exists');
			return res.redirect(req.baseUrl+'/setting');
		}
		await SettingPpmRiskAssessmentColor.deleteOne({_id: req.params.id});

		req.flash('success_msg', 'Add color successfully');
		return res.redirect(req.baseUrl+'/setting');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		req.flash('error_msg', 'Something want wrong');
		return res.redirect('back');
	}
}