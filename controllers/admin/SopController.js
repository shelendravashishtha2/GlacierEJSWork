const { check, validationResult } = require('express-validator');
const Property = require("../../models/Property");
const fs = require('fs')
const path = require('path');
const response = require("../../helper/response");
const mongoose = require("mongoose");
const {errorLog} = require("../../helper/consoleLog");
const PropertyResource = require('../resources/PropertyResource');
const Joi = require("joi");
const SOP = require('../../models/SOP');

// SOP List Page
exports.sopList = async (req,res) => {
	try {
		res.locals = { title: 'Manage Rating'};
		let propertyData = await Property.find({});
		return res.render('Admin/SOP/index',{'data':PropertyResource(propertyData)});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

//Create SOP Page
exports.createSop = async (req,res) => {
	try {
		res.locals = { title: 'Manage Rating'};
		let propertyData = await Property.find({});
		// return res.render('Admin/SOP/create',{'data':PropertyResource(propertyData)});
		return res.render('Admin/SOP/create');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

//store SOP
exports.storeSop = async (req,res) => {
	try {
		if (req.body.test) {
			// req.checkBody('name','Name field is required').notEmpty();
			// req.checkBody('email','Email field is required').notEmpty();
			// req.checkBody('email','Email is not valid').isEmail();
			// req.checkBody('username','Username field is required').notEmpty();
			// req.checkBody('password','Password field is required').notEmpty();
			// req.checkBody('password2','Passwords do not match').equals(req.body.password);

			// errors = validationResult(req);
			// if(errors){
			// 	console.log("errors: " + errors);
			// 	// res.render('register', {errors: errors});
			// } else{
			// 	console.log('No Errors');
			// 	// res.render("/");
			// }
		}

		let single_category_files_array = [];
		let sub_category_array = [];

		if (req.files) {
			let uploadPath = __basedir + '/public/images/sop_files/';
			
			if (req.files.single_category_files && req.body.category_level == 1) {
				let single_category_files = req.files.single_category_files;
				single_category_files = Array.isArray(single_category_files) ? single_category_files : [single_category_files];
				if (Array.isArray(single_category_files)) {
					single_category_files.forEach(single_category_file => {
						if (single_category_file.mimetype !== "application/pdf"){
							return res.send(response.error(400, 'File format should be PDF', []));
						}
					});
					single_category_files.forEach(single_category_file => {
						fileName = single_category_file.name;
						single_category_file.mv(uploadPath + fileName, function(err) {
							if (err){
								return res.send(response.error(400, 'Image uploading failed', []));
							}
						});
						single_category_files_array.push(fileName);
					});
				}
			}
			
			if (req.files['sub_category_files[0]'] && req.body.category_level == 2) {
				if (req.body.category_level == 2) {
					for (let i = 0; i < req.body.sub_category_count; i++) {
						let sub_category_files_array = [];
						let sub_category_files = req.files['sub_category_files['+i+']'];
						sub_category_files = Array.isArray(sub_category_files) ? sub_category_files : [sub_category_files];
						if (Array.isArray(sub_category_files)) {
							sub_category_files.forEach(sub_category_file => {
								if (sub_category_file.mimetype !== "application/pdf"){
									return res.send(response.error(400, 'File format should be PDF', []));
								}
							});
							sub_category_files.forEach(sub_category_file => {
								fileName = sub_category_file.name;
								sub_category_file.mv(uploadPath + fileName, function(err) {
									if (err){
										return res.send(response.error(400, 'Image uploading failed', []));
									}
								});
								sub_category_files_array.push(fileName);
							});
						}
						let sub_category_name = req.body['sub_category_name['+i+']'];
						if (sub_category_name != null && sub_category_files_array != null && sub_category_name != '' && sub_category_files_array != '') {
							sub_category_array.push({sub_category_name: sub_category_name, sub_category_files: sub_category_files_array});
						}
					}
				}
			}
		}
		
		// let sub_category_array = [];
		// if (req.body.category_level == 2) {
		// 	for (let i = 0; i < req.body.sub_category_count; i++) {
		// 		let sub_category_name = req.body['sub_category_name['+i+']'];
		// 		let sub_category_files = req.body['sub_category_files['+i+']'];
		// 		if (sub_category_name != null && sub_category_files != null && sub_category_name != '' && sub_category_files != '') {
		// 			sub_category_array.push({sub_category_name: sub_category_name, sub_category_files: sub_category_files});
		// 		}
		// 	}
		// }

		const SOPData = new SOP({
			category_name: req.body.category_name,
			level: req.body.category_level,
			single_category_files: single_category_files_array,
			sub_category: sub_category_array,
		});
		await SOPData.save();

		return res.send(response.success(200, 'success', [SOPData]));
		// return res.redirect('/create-sop');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}