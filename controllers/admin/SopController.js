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
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Manage Rating', session:req.session};

		let sopData = await SOP.find({});
		return res.render('Admin/SOP/index',{data: sopData});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

//Create SOP Page
exports.createSop = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Manage Rating', session:req.session};
		let sopData = await SOP.find({});
		// return res.render('Admin/SOP/create',{'data':PropertyResource(sopData)});
		return res.render('Admin/SOP/create');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

//store SOP
exports.storeSop = async (req,res) => {
	try {
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

		const SOPData = new SOP({
			category_name: req.body.category_name,
			level: req.body.category_level,
			single_category_files: single_category_files_array,
			sub_category: sub_category_array,
		});
		await SOPData.save();

		// return res.send(response.success(200, 'success', [SOPData]));
		return res.redirect('/sop');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

//edit SOP
exports.editSop = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Manage Rating', session:req.session};
		let sopData = await SOP.findOne({_id: req.params.id});
		
		return res.render('Admin/SOP/edit', { data: sopData });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

//update SOP
exports.updateSop = async (req,res) => {
	try {

		// var arrayFields = ["sub_category_name"];
		// var regexString = `^(${arrayFields.join("|")})\\[\\d+\\]`;
		// var regex = new RegExp(regexString);
		// var newObj = Object.keys(req.body)
		// 	.filter(aKey => regex.test(aKey))
		// 	.reduce((combinedObj, aKey) => {
		// 		var keyName = aKey.match(regex)[1];
		// 		if (!combinedObj[keyName]) {
		// 		combinedObj[keyName] = [];
		// 		}
		// 		combinedObj[keyName].push(req.body[aKey]);
		// 		return combinedObj;
		// 	}, {});
		// console.log(newObj);
		// console.log(newObj.sub_category_name.length);

		// // console.log(req.files);

		// return res.send(req.body);
		// return res.send([[req.body],[req.files]]);
		// if(!req.session.user){ return res.redirect('/login'); }
		// res.locals = { title: 'SOP', session:req.session};

		// let single_category_files_array = [];
		// let sub_category_array = [];
		// const uploadPath = __basedir + '/public/images/sop_files/';

		// if (req.files) {
			
		// 	if (req.body.category_level == 1 && req.files.single_category_files) {
		// 		let single_category_files = req.files.single_category_files;
		// 		single_category_files = Array.isArray(single_category_files) ? single_category_files : [single_category_files];
		// 		if (Array.isArray(single_category_files)) {
		// 			single_category_files.forEach(single_category_file => {
		// 				if (single_category_file.mimetype !== "application/pdf"){
		// 					return res.send(response.error(400, 'File format should be PDF', []));
		// 				}
		// 			});
		// 			single_category_files.forEach(single_category_file => {
		// 				fileName = single_category_file.name;
		// 				single_category_file.mv(uploadPath + fileName, function(err) {
		// 					if (err){
		// 						return res.send(response.error(400, 'Image uploading failed', []));
		// 					}
		// 				});
		// 				single_category_files_array.push(fileName);
		// 			});
		// 		}
		// 	}
			
		// 	if (req.body.category_level == 2 && req.files['sub_category_files[0]']) {

		// 		for (let i = 0; i < req.body.sub_category_count; i++) {
		// 			let sub_category_files_array = [];
		// 			let sub_category_files = req.files['sub_category_files['+i+']'];
		// 			sub_category_files = Array.isArray(sub_category_files) ? sub_category_files : [sub_category_files];
		// 			if (Array.isArray(sub_category_files)) {
		// 				sub_category_files.forEach(sub_category_file => {
		// 					if (sub_category_file.mimetype !== "application/pdf"){
		// 						return res.send(response.error(400, 'File format should be PDF', []));
		// 					}
		// 				});
		// 				sub_category_files.forEach(sub_category_file => {
		// 					fileName = sub_category_file.name;
		// 					sub_category_file.mv(uploadPath + fileName, function(err) {
		// 						if (err){
		// 							return res.send(response.error(400, 'Image uploading failed', []));
		// 						}
		// 					});
		// 					sub_category_files_array.push(fileName);
		// 				});
		// 			}
		// 			let sub_category_name = req.body['sub_category_name['+i+']'];
		// 			if (sub_category_name != null && sub_category_files_array != null && sub_category_name != '' && sub_category_files_array != '') {
		// 				sub_category_array.push({sub_category_name: sub_category_name, sub_category_files: sub_category_files_array});
		// 			}
		// 		}
		// 	}
		// }

		// let SOPData = await SOP.findOne({_id: req.params.id});
		// SOPData.category_name = req.body.category_name;
		// SOPData.level = req.body.category_level;
		// SOPData.single_category_files = single_category_files_array;
		// SOPData.sub_category = sub_category_array;
		// // await SOPData.save();

		// return res.send(response.success(200, 'success', [SOPData]));
		// return res.redirect('/sop');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}