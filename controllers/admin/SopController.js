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


exports.changeSOPStatus = async (req,res) => {
	try {
		let schema = Joi.object({
			_id: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let data = await SOP.findOne({_id: req.body._id});
		data.status == 0 ? data.status = 1 : data.status = 0;
		data.save();

		return res.send(response.success(200, 'Status update successfully', data.status));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.success(500, 'Something want wrong', []));
	}
}
// SOP List Page
exports.sopList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Sop List', session:req.session};

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 10};
		let skip = { $skip : (page - 1) * 10};
		let project = {
			$project:{
				category_name:1,
				sub_category:1,
				single_category_files:1,
				status:1,
				level:1
			}
		}

		let query1 = {};
		if(req.query.search){
			query1['property_name'] = {$regex: new RegExp(req.query.search, 'i')};
		}
		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                createdAt:-1
            }
        };
		
		let totalProperty = await SOP.count(query1);
		totalPage = Math.ceil(totalProperty/10);
		let sopData = await SOP.aggregate([search,sort,skip,limit,project]);

		return res.render('Admin/SOP/index',{data: sopData,page:page,totalPage:totalPage,search:req.query.search?req.query.search:"",'message': req.flash('message'), 'error': req.flash('error')});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

//Create SOP Page
exports.deleteSopImage = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		let sop = await SOP.findOne({_id:req.body.sopId});
		if(sop.level == 1){
			let index = sop.single_category_files.indexOf(req.body.file);
			sop.single_category_files.splice(index,1);
			sop.markModified("single_category_files");
		}else{
			let index = sop.sub_category.findIndex((x)=> String(x._id) == req.body.subId);
			if(index >=0){
				let index1 = sop.sub_category[index].sub_category_files.indexOf(req.body.file);
				sop.sub_category[index].sub_category_files.splice(index1,1);
			}
			sop.sub_category[index].markModified("sub_category_files");
		}
		console.log('./public/images/sop_files/'+req.body.file);
			fs.unlink('./public/images/sop_files/'+req.body.file, function (error, file) {
				
			})
		sop.save();
		return res.status(200).send({
		    "status": true,
		    "status_code": "200",
		    "message": "Deleted successfully"
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
exports.createSop = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Create Sop', session:req.session};
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
						fileName = single_category_file.name.trim().split(" ").join("_");
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
				req.body.sub_category_name = Array.isArray(req.body.sub_category_name) ? req.body.sub_category_name : [req.body.sub_category_name]
				for (let i = 0; i < req.body.sub_category_name.length; i++) {
					let sub_category_files_array = [];
					let sub_category_files = req.files['sub_category_files['+i+']'];
					sub_category_files = Array.isArray(sub_category_files) ? sub_category_files : [sub_category_files];
					
					if (Array.isArray(sub_category_files)) {
						sub_category_files.forEach(sub_category_file => {
							if (sub_category_file != undefined) {
								if (sub_category_file.mimetype !== "application/pdf"){
									return res.send(response.error(400, 'File format should be PDF', []));
								}
							}
						});
						sub_category_files.forEach(sub_category_file => {
							if (sub_category_file != undefined) {
								fileName = sub_category_file.name.trim().split(" ").join("_");
								sub_category_file.mv(uploadPath + fileName, function(err) {
									if (err){
										return res.send(response.error(400, 'Image uploading failed', []));
									}
								});
								sub_category_files_array.push(fileName);
							}
						});
					}
					let sub_category_name = req.body.sub_category_name[i];
					if (sub_category_name != null && sub_category_files_array != null && sub_category_name != '' && sub_category_files_array != '') {
						sub_category_array.push({sub_category_name: sub_category_name, sub_category_files: sub_category_files_array});
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

		req.flash('message', 'SOP is added!');
		return res.redirect('/sop');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

//edit SOP
exports.editSop = async (req,res) => {
	try {
		res.locals = { title: 'Edit Sop', session:req.session};
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
		res.locals = { title: 'Update Sop', session: req.session};

		let single_category_files_array = [];
		let sub_category_array = [];
		const uploadPath = __basedir + '/public/images/sop_files/';

		if (req.body.category_level == 1) { //for category_level= 1
			if (req.files && req.files.single_category_files) {
				let single_category_files = req.files.single_category_files;
				single_category_files = Array.isArray(single_category_files) ? single_category_files : [single_category_files];
				if (Array.isArray(single_category_files)) {
					single_category_files.forEach(single_category_file => {
						if (single_category_file.mimetype !== "application/pdf"){
							return res.send(response.error(400, 'File format should be PDF', []));
						}
					});
					single_category_files.forEach(single_category_file => {
						fileName = single_category_file.name.trim().split(" ").join("_");
						single_category_file.mv(uploadPath + fileName, function(err) {
							if (err){
								return res.send(response.error(400, 'Image uploading failed', []));
							}
						});
						single_category_files_array.push(fileName);
					});
				}
			} else {
			}

			let SOPData = await SOP.findOne({_id: req.body.id});
			SOPData.category_name = req.body.category_name;
			SOPData.single_category_files = SOPData.level == 1 ? SOPData.single_category_files.concat(single_category_files_array) : [];
			await SOPData.save();

			console.log("Level 1 SOP updated: ", SOPData);

		} else if (req.body.category_level == 2) { //for category_level= 2
			let arrayFields = ["sub_category_name"];
			let regexString = `^(${arrayFields.join("|")})\\[\\d+\\]`;
			let regex = new RegExp(regexString);
			let subCategoryNameObj = Object.keys(req.body)
				.filter(aKey => regex.test(aKey))
				.reduce((combinedObj, aKey) => {
					let keyName = aKey.match(regex)[1];
					if (!combinedObj[keyName]) {
						combinedObj[keyName] = [];
					}
					combinedObj[keyName].push(req.body[aKey]);
					return combinedObj;
				}, {});

			for (let i = 0; i < subCategoryNameObj.sub_category_name.length; i++) {
				let sub_category_files_array = [];
				let sub_category_id = req.body['sub_category_id['+i+']'];
				let sub_category_name = req.body['sub_category_name['+i+']'];

				if (req.files && req.files['sub_category_files['+i+']'] != undefined) {
					let sub_category_files = req.files['sub_category_files['+i+']'];

					sub_category_files = Array.isArray(sub_category_files) ? sub_category_files : [sub_category_files];
					if (Array.isArray(sub_category_files)) {
						sub_category_files.forEach(sub_category_file => {
							if (sub_category_file.mimetype !== "application/pdf"){
								return res.send(response.error(400, 'File format should be PDF', []));
							}
						});
						sub_category_files.forEach(sub_category_file => {
							fileName = sub_category_file.name.trim().split(" ").join("_");
							sub_category_file.mv(uploadPath + fileName, function(err) {
								if (err){
									return res.send(response.error(400, 'Image uploading failed', []));
								}
							});
							sub_category_files_array.push(fileName);
						});
					}
					if (sub_category_name != null && sub_category_files_array != null && sub_category_name != '' && sub_category_files_array != '') {
						sub_category_array.push({_id: sub_category_id, sub_category_name: sub_category_name, sub_category_files: sub_category_files_array});
					}
				} else {
					sub_category_array.push({_id: sub_category_id, sub_category_name: sub_category_name, sub_category_files: []});
				}
			}

			let SOPData = await SOP.findOne({_id: req.body.id});
			SOPData.category_name = req.body.category_name;
			for (let i = 0; i < sub_category_array.length; i++) {
				for (let j = 0; j < SOPData.sub_category.length; j++) {
					if (String(sub_category_array[i]._id) == String(SOPData.sub_category[j]._id)) {
						sub_category_array[i].sub_category_files = [...SOPData.sub_category[j].sub_category_files, ...sub_category_array[i].sub_category_files]
					}
				}
			}
			SOPData.sub_category = sub_category_array;
			await SOPData.save();

			// console.log("Level 2 SOP updated: ", SOPData);
		}

		req.flash('message', 'SOP is updated!');
		return res.redirect('/sop');
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// View view Sop Page
exports.viewSop = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'View SOP', session: req.session};

		let sopData = await SOP.findOne({_id: req.params.id});

		return res.render('Admin/SOP/view',{ data: sopData });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}