const User = require("../../models/User");
const Property = require("../../models/Property");
const MngRatingGroup = require("../../models/mngRatingGroup");
const MngRatingTopic = require("../../models/mngRatingTopic");
const MngRatingCheckList = require("../../models/mngRatingCheckList");
const MngRatingAssignAuditor = require("../../models/mngRatingAssignAuditor");
const MngRatingAssignAuditorTopic = require("../../models/mngRatingAssignAuditorTopic");
const MngRatingAssignAuditorTopicWiseCheckList = require("../../models/mngRatingAssignAuditorTopicWiseCheckList");
const fs = require('fs')
const path = require('path');
const bcrypt = require("bcryptjs");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {errorLog} = require("../../helper/consoleLog");
const PropertyResource = require('../resources/PropertyResource');
const { check,sanitizeBody,validationResult,matchedData } = require('express-validator');
const Joi = require("joi");

// Manage Rating List Page
exports.manageRatingList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Manage Rating',session: req.session};
		let propertyData = await Property.find({status:1});
		
		return res.render('Admin/Manage-Rating/index',{'data':PropertyResource(propertyData),'message': req.flash('message'), 'error': req.flash('error')});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Add new group
exports.addGroup = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Group Add', session: req.session};

		const errors = validationResult(req);
		if(!errors.isEmpty()){
			let errMsg = errors.mapped();
			req.session.error = {errMsg: errMsg, inputData: req.body};
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		const groupStore = await MngRatingGroup.create({
			groupName:req.body.groupName
		})
		const topicStore = await MngRatingTopic.create({
			ratingGroupId:groupStore._id,
			topicName:req.body.topicName
		})

		let groupCheckList = new MngRatingCheckList({
			ratingGroupId:groupStore._id,
			ratingTopicId:topicStore._id,
			checkListTitle: req.body.checkListTitle,
			cueForAuditor: req.body.cueForAuditor,
			weightage: req.body.weightage,
		});
		await groupCheckList.save();
		
		req.flash('message', 'Group is added!');
		return res.redirect('/group-list');
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error', errorMessage.message);
			return res.redirect('/group-list');
		} else {
			errorLog(__filename, req.originalUrl, error);
			req.flash('error', 'Something want wrong');
			return res.redirect('/group-list');
		}
	}
}

exports.addTopic = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Topic Add', session: req.session};

		const errors = validationResult(req);
		if(!errors.isEmpty()){
			let errMsg = errors.mapped();
			req.session.error = {errMsg: errMsg, inputData: req.body};
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		const topicStore = await MngRatingTopic.create({
			ratingGroupId:req.body.groupId,
			topicName:req.body.topicName
		})

		let groupCheckList = new MngRatingCheckList({
			ratingGroupId:req.body.groupId,
			ratingTopicId:topicStore._id,
			checkListTitle: req.body.checkListTitle,
			cueForAuditor: req.body.cueForAuditor,
			weightage: req.body.weightage,
		});
		await groupCheckList.save();
		
		req.flash('message', 'Topic is added!');
		return res.redirect('/edit-group-name/'+req.body.groupId);
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error', errorMessage.message);
			return res.redirect('back');
		} else {
			errorLog(__filename, req.originalUrl, error);
			req.flash('error', 'Something want wrong');
			return res.redirect('back');
		}
	}
}
exports.addTopicChecklist = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Topic Checklist Add', session: req.session};

		const errors = validationResult(req);
		if(!errors.isEmpty()){
			let errMsg = errors.mapped();
			req.session.error = {errMsg: errMsg, inputData: req.body};
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		if(req.body.checkListId){
			await MngRatingCheckList.updateOne({_id: req.body.checkListId},{
				checkListTitle: req.body.checkListTitle,
				cueForAuditor: req.body.cueForAuditor,
				weightage: req.body.weightage,
			})
			message = "Topic checklist is is updated!";
		}else{
			let topicCheckList = new MngRatingCheckList({
				ratingGroupId:req.body.ratingGroupId,
				ratingTopicId:req.body.ratingTopicId,
				checkListTitle: req.body.checkListTitle,
				cueForAuditor: req.body.cueForAuditor,
				weightage: req.body.weightage,
			});
			await topicCheckList.save();
			message = "Topic checklist is is addeed!";
		}
		req.flash('message', message);
		return res.redirect('/edit-topic/'+req.body.ratingTopicId);
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error', errorMessage.message);
			return res.redirect('back');
		} else {
			errorLog(__filename, req.originalUrl, error);
			req.flash('error', 'Something want wrong');
			return res.redirect('back');
		}
	}
}

exports.storeAssignAuditor = async (req,res) => {
	try {

		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Store Assign Auditor', session: req.session};

		const errors = validationResult(req);
		if(!errors.isEmpty()){
			let errMsg = errors.mapped();
			req.session.error = {errMsg: errMsg, inputData: req.body};
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		for(let i=0;i< req.body.groupId.length; i++){
			let assignAuditor = new MngRatingAssignAuditor({
				propertyId:req.body.propertyId,
				groupId:req.body.groupId[i],
				auditorId: req.body.auditorId,
			});
			await assignAuditor.save();

			// store group wise topic list. 
			let ratingTopic = await MngRatingTopic.find({ratingGroupId: req.body.groupId[i],status:1});
			if(ratingTopic){
				for (let j = 0; j < ratingTopic.length; j++) {
					const element = ratingTopic[j];
					let topicStore = await MngRatingAssignAuditorTopic.create({
						propertyId:req.body.propertyId,
						groupId:element.ratingGroupId,
						topicId:element._id,
						auditorId: req.body.auditorId
					})
				}
			}

			// store topic wise checklist. 
			let checklist = await MngRatingCheckList.find({ratingGroupId: req.body.groupId[i],status:1});
			if(checklist){
				for (let k = 0; k < checklist.length; k++) {
					const elementChecklist = checklist[k];
					let topicCheckListStore = await MngRatingAssignAuditorTopicWiseCheckList.create({
						propertyId:req.body.propertyId,
						ratingGroupId:elementChecklist.ratingGroupId,
						ratingTopicId:elementChecklist.ratingTopicId,
						checkListId: elementChecklist._id,
						auditorId: req.body.auditorId
					})
				}
			}

		}
		message = "Group is assigned";
		req.flash('message', message);
		return res.redirect('/manage-rating');
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error', errorMessage.message);
			return res.redirect('back');
		} else {
			errorLog(__filename, req.originalUrl, error);
			req.flash('error', 'Something want wrong');
			return res.redirect('back');
		}
	}
}

exports.assignAuditor = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Assign Auditor - Manage Rating',session: req.session};
		let propertyData = await Property.find({});
		let groupNameData = await MngRatingGroup.find({status:1});
		let auditorData =await User.find({status:1,position_id:3});
		return res.render('Admin/Manage-Rating/assign-auditor',{'data':PropertyResource(propertyData),groupNameData:groupNameData,auditorData:auditorData});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.groupList = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Manage Group',session: req.session};
	
		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 10};
		let skip = { $skip : (page - 1) * 10};
		let project = {
			$project:{
				groupName:1,
				status:1
			}
		}
		let query1 = {};
		if(req.query.search){
			query1['groupName'] = {$regex: new RegExp(req.query.search, 'i')};
		}
		let totalProperty = await MngRatingGroup.count(query1);
		totalPage = Math.ceil(totalProperty/10);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                createdAt:-1
            }
		};

		let groupData = await MngRatingGroup.aggregate([search,sort,skip,limit,project]);

		return res.render('Admin/Manage-Rating/group-list',{'data':groupData,page:page,totalPage:totalPage,search:req.query.search?req.query.search:"",'message': req.flash('message'), 'error': req.flash('error')});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.editGroup = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Edit Group',session: req.session};
		let propertyData = await Property.find({});
		return res.render('Admin/Manage-Rating/edit-group',{'data':PropertyResource(propertyData)});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.editGroupName = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Edit Group Name & Topic Name',session: req.session};
	
		let condition = {"$match": {ratingGroupId: ObjectId(req.params.id)}};
		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 10};
		let skip = { $skip : (page - 1) * 10};
		let project = {
			$project:{
				topicName:1,
				status:1
			}
		}
		let query1 = {};
		if(req.query.search){
			query1['topicName'] = {$regex: new RegExp(req.query.search, 'i')};
		}
		let totalProperty = await MngRatingTopic.count(query1);
		totalPage = Math.ceil(totalProperty/10);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                createdAt:-1
            }
		};
		let topicData = await MngRatingTopic.aggregate([condition,search,sort,skip,limit,project]);
		const groupDetails = await MngRatingGroup.findOne({ _id: ObjectId(req.params.id) });
		return res.render('Admin/Manage-Rating/edit-group-name',{'data':topicData,groupDetails:groupDetails,page:page,totalPage:totalPage,search:req.query.search?req.query.search:"",groupId:req.params.id,'message': req.flash('message'), 'error': req.flash('error')});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.editTopic = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		res.locals = { title: 'Edit Topic & Checklists',session: req.session};
		
		let condition = {"$match": {ratingTopicId: ObjectId(req.params.id)}};
		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 10};
		let skip = { $skip : (page - 1) * 10};
		let project = {
			$project:{
				ratingGroupId:1,
				ratingTopicId:1,
				checkListTitle:1,
				cueForAuditor:1,
				weightage:1,
				status:1
			}
		}
		let query1 = {};
		if(req.query.search){
			query1['checkListTitle'] = {$regex: new RegExp(req.query.search, 'i')};
		}
		let totalProperty = await MngRatingCheckList.count(query1);
		totalPage = Math.ceil(totalProperty/10);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                createdAt:-1
            }
		};
		let topicData = await MngRatingCheckList.aggregate([condition,search,sort,skip,limit,project]);
		let topicDetails = await MngRatingTopic.findOne({ _id: ObjectId(req.params.id) }).populate({"path": "ratingGroupId"});
		return res.render('Admin/Manage-Rating/edit-topic',{'data':topicData,topicDetails:topicDetails,page:page,totalPage:totalPage,search:req.query.search?req.query.search:"",groupId:req.params.id,'message': req.flash('message'), 'error': req.flash('error')});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Update group status
exports.updateGroupStatus = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		let schema = Joi.object({
			grpId: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let ratingGroup = await MngRatingGroup.findOne({_id: req.body.grpId});
		if(ratingGroup.status == 0){
			ratingGroup.status = 1;
		}else{
			ratingGroup.status = 0;
		}
		ratingGroup.save();
		return res.status(200).send({
		    "status": true,
		    "status_code": "200",
		    "message": "Status is updated!"
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Update rating topic status
exports.updateRatingTopicStatus = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		let schema = Joi.object({
			topicId: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let ratingTopic = await MngRatingTopic.findOne({_id: req.body.topicId});
		if(ratingTopic.status == 0){
			ratingTopic.status = 1;
		}else{
			ratingTopic.status = 0;
		}
		ratingTopic.save();
		return res.status(200).send({
		    "status": true,
		    "status_code": "200",
		    "message": "Status is updated!"
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
// Update topic checklist status
exports.updateTopicChecklistStatus = async (req,res) => {
	try {
		if(!req.session.user){ return res.redirect('/login'); }
		let schema = Joi.object({
			topicCheckListId: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let ratingTopic = await MngRatingCheckList.findOne({_id: req.body.topicCheckListId});
		if(ratingTopic.status == 0){
			ratingTopic.status = 1;
		}else{
			ratingTopic.status = 0;
		}
		ratingTopic.save();
		return res.status(200).send({
		    "status": true,
		    "status_code": "200",
		    "message": "Status is updated!"
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Update group name
exports.updateGroupName = async (req,res) => {
	try {
		let groupNameData = await MngRatingGroup.findOne({groupName: req.body.group_name});
		if (!groupNameData) {
			let groupNameData = await MngRatingGroup.updateOne({_id: req.body.group_id}, {groupName: req.body.group_name});
		} else {
			req.flash('error', 'Group name already exists!');
			return res.redirect('back');
		}
		req.flash('message', 'Group name is updated!');
		return res.redirect('edit-group-name/'+req.body.group_id);
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		req.flash('error', 'Something want wrong');
		return res.redirect('back');
	}
}

// Update topic name
exports.updateTopicName = async (req,res) => {
	try {
		let topicNameData = await MngRatingTopic.findOne({topicName: req.body.topic_name});
		if (!topicNameData) {
			let topicNameData = await MngRatingTopic.updateOne({_id: req.body.topic_id}, {topicName: req.body.topic_name});
		} else {
			req.flash('error', 'Topic name already exists!');
			return res.redirect('back');
		}
		req.flash('message', 'Topic name is updated!');
		return res.redirect('edit-topic/'+req.body.topic_id);
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		req.flash('error', 'Something want wrong');
		return res.redirect('back');
	}
}