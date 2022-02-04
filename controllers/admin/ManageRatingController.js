const User = require("../../models/User");
const Property = require("../../models/Property");
const MngRatingGroupMaster = require("../../models/MngRatingGroupMaster");
const MngRatingTopicMaster = require("../../models/MngRatingTopicMaster");
const MngRatingChecklistMaster = require("../../models/MngRatingChecklistMaster");
const MngRatingGroupAssign = require("../../models/MngRatingGroupAssign");
const MngRatingTopicAssign = require("../../models/MngRatingTopicAssign");
const MngRatingChecklistAssign = require("../../models/MngRatingChecklistAssign");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { errorLog } = require("../../helper/consoleLog");
const PropertyResource = require('../resources/PropertyResource');
const { check, sanitizeBody, validationResult, matchedData } = require('express-validator');
const Joi = require("joi");
const { Validator } = require('node-input-validator');
const MngRatingTaskAssign = require("../../models/MngRatingTaskAssign");

// Manage Rating List Page
exports.manageRatingList = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Manage Rating', session: req.session };

		// let propertyData = await Property.find({status:1});

		// let findQuery = { status: 1 }
		// if (req.query.search) {
		// 	findQuery.property_name = { $regex: new RegExp(req.query.search, 'i') }
		// };
		// const options = {
		// 	page: req.query.page ? Math.max(1, req.query.page) : 1,
		// 	limit: 10
		// };
		// let propertyData = await Property.paginate(findQuery, options);

		// let propertyIds = await MngRatingGroupAssign.distinct('propertyId');
		// let propertyData = await MngRatingGroupAssign.find({status:1}).populate({path: 'propertyId'}).populate({path: 'auditorId'});

		let findQuery = { status: 1 }
		if (req.query.search) {
			findQuery.property_name = { $regex: new RegExp(req.query.search, 'i') }
		};
		let options = {
			populate: [{path: 'propertyId'}, {path: 'auditorId'}],
			page: req.query.page ? Math.max(1, req.query.page) : 1,
			limit: 10
		};
		let propertyData = await MngRatingGroupAssign.paginate(findQuery, options);

		return res.render('Admin/Manage-Rating/index', {
			propertyData: propertyData,
			search: req.query.search,
			message: req.flash('message'),
			error: req.flash('error'),
		})
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Add new group
exports.addGroup = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Group Add', session: req.session };

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			let errMsg = errors.mapped();
			req.session.error = { errMsg: errMsg, inputData: req.body };
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		const groupStore = await MngRatingGroupMaster.create({
			groupName: req.body.groupName
		})
		const topicStore = await MngRatingTopicMaster.create({
			ratingGroupId: groupStore._id,
			topicName: req.body.topicName
		})

		let groupChecklist = new MngRatingChecklistMaster({
			ratingGroupId: groupStore._id,
			ratingTopicId: topicStore._id,
			checklistTitle: req.body.checklistTitle,
			cueForAuditor: req.body.cueForAuditor,
			weightage: req.body.weightage,
		});
		await groupChecklist.save();

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

exports.addTopic = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Topic Add', session: req.session };

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			let errMsg = errors.mapped();
			req.session.error = { errMsg: errMsg, inputData: req.body };
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		const topicStore = await MngRatingTopicMaster.create({
			ratingGroupId: req.body.groupId,
			topicName: req.body.topicName
		})

		let groupChecklist = new MngRatingChecklistMaster({
			ratingGroupId: req.body.groupId,
			ratingTopicId: topicStore._id,
			checklistTitle: req.body.checklistTitle,
			cueForAuditor: req.body.cueForAuditor,
			weightage: req.body.weightage,
		});
		await groupChecklist.save();

		req.flash('message', 'Topic is added!');
		return res.redirect('/edit-group-name/' + req.body.groupId);
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

exports.addTopicChecklist = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Topic Checklist Add', session: req.session };

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			let errMsg = errors.mapped();
			req.session.error = { errMsg: errMsg, inputData: req.body };
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		if (req.body.checklistId) {
			await MngRatingChecklistMaster.updateOne({ _id: req.body.checklistId }, {
				checklistTitle: req.body.checklistTitle,
				cueForAuditor: req.body.cueForAuditor,
				weightage: req.body.weightage,
			})
			message = "Topic checklist is is updated!";
		} else {
			let topicChecklist = new MngRatingChecklistMaster({
				ratingGroupId: req.body.ratingGroupId,
				ratingTopicId: req.body.ratingTopicId,
				checklistTitle: req.body.checklistTitle,
				cueForAuditor: req.body.cueForAuditor,
				weightage: req.body.weightage,
			});
			await topicChecklist.save();
			message = "Topic checklist is is addeed!";
		}
		req.flash('message', message);
		return res.redirect('/edit-topic/' + req.body.ratingTopicId);
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

exports.assignAuditor = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Assign Auditor - Manage Rating', session: req.session };

		let assignedPropertyIds = await MngRatingGroupAssign.find({}).distinct('propertyId');
		let propertyData = await Property.find({_id: {$nin: assignedPropertyIds}});
		// let propertyData = await Property.find({});
		let groupNameData = await MngRatingGroupMaster.find({ status: 1 });
		let auditorData = await User.find({ status: 1, position_id: 3 });

		return res.render('Admin/Manage-Rating/assign-auditor', {
			data: PropertyResource(propertyData),
			groupNameData: groupNameData,
			auditorData: auditorData,
		})
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.storeAssignAuditor = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Store Assign Auditor', session: req.session };

		req.body.groupId = Array.isArray(req.body.groupId) ? req.body.groupId : [req.body.groupId];

		const validate = new Validator(req.body, {
			propertyId: 'required',
			groupId: 'required',
			auditorId: 'required',
		});
		const matched = await validate.check();
		if (!matched) {
			console.log(validate.errors);
			req.session.errors = {errMsg: validate.errors, inputData: req.body};
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		if (req.body.groupId.length > 0) {
			let assignAuditor = new MngRatingGroupAssign({
				propertyId: req.body.propertyId,
				groupIds: req.body.groupId,
				auditorId: req.body.auditorId,
			});
			await assignAuditor.save();
	
			for (let i = 0; i < req.body.groupId.length; i++) {
				// let MngRatingGroupMasterData = await MngRatingGroupMaster.find({ _id: req.body.groupId[i] });
	
				// store group wise topic list. 
				let ratingTopicIds = await MngRatingTopicMaster.find({ ratingGroupId: req.body.groupId[i], status: 1 }).distinct('_id'); //get only Ids in array
				console.log(ratingTopicIds);
				if (ratingTopicIds.length > 0) {
					let topicAssignStore = await MngRatingTopicAssign.create({
						propertyId: req.body.propertyId,
						groupId: req.body.groupId[i],
						topicIds: ratingTopicIds,
						// auditorId: req.body.auditorId
					})
				}
	
				// store topic wise checklist. 
				let checklistIds = await MngRatingChecklistMaster.find({ ratingGroupId: req.body.groupId[i], status: 1 }).distinct('_id'); //get only Ids in array
				let checklistData = await MngRatingChecklistMaster.find({ ratingGroupId: req.body.groupId[i], status: 1 });
				if (checklistData.length > 0) {
					for (let k = 0; k < checklistData.length; k++) {
						let topicChecklistStore = await MngRatingChecklistAssign.create({
							propertyId: req.body.propertyId,
							ratingGroupId: checklistData[k].ratingGroupId,
							ratingTopicId: checklistData[k].ratingTopicId,
							checklistIds: checklistIds,
							// auditorId: req.body.auditorId,
						})
					}
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

exports.groupList = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Manage Group', session: req.session };

		let page = 1;
		if (req.query.page != undefined) {
			page = req.query.page;
		}
		let limit = { $limit: 10 };
		let skip = { $skip: (page - 1) * 10 };
		let project = {
			$project: {
				groupName: 1,
				status: 1
			}
		}
		let query1 = {};
		if (req.query.search) {
			query1['groupName'] = { $regex: new RegExp(req.query.search, 'i') };
		}
		let totalProperty = await MngRatingGroupMaster.count(query1);
		totalPage = Math.ceil(totalProperty / 10);

		let search = { "$match": { $or: [query1] } };
		let sort = {
			$sort: {
				createdAt: -1
			}
		};

		let groupData = await MngRatingGroupMaster.aggregate([search, sort, skip, limit, project]);

		return res.render('Admin/Manage-Rating/group-list', { 'data': groupData, page: page, totalPage: totalPage, search: req.query.search ? req.query.search : "", 'message': req.flash('message'), 'error': req.flash('error') });

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.editGroup = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Edit Assign Group', session: req.session };

		let propertyData = await Property.findOne({_id: req.query.propertyId});
		let allGroupList = await MngRatingGroupMaster.find({ status: 1 });
		let auditorList = await User.find({ status: 1, position_id: 3 });
		let assignGroupData = await MngRatingGroupAssign.findOne({ propertyId: req.query.propertyId });

		return res.render('Admin/Manage-Rating/edit-group', {
			propertyData: propertyData,
			allGroupList: allGroupList,
			assignGroupData: assignGroupData,
			auditorList: auditorList,
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.updateAssignGroups = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Store Assign Auditor', session: req.session };

		req.body.groupId = Array.isArray(req.body.groupId) ? req.body.groupId : [req.body.groupId];

		const validate = new Validator(req.body, {
			propertyId: 'required',
			assignGroupId: 'required',
			groupId: 'required',
			auditorId: 'required',
		});
		const matched = await validate.check();
		if (!matched) {
			req.session.errors = {errMsg: validate.errors, inputData: req.body};
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		if (req.body.groupId.length > 0) {
			let MngRatingGroupAssignData = await MngRatingGroupAssign.findOneAndUpdate({ propertyId: req.body.propertyId }, {
				groupIds: req.body.groupId,
				auditorId: req.body.auditorId
			});

			let assignTopicDelete = await MngRatingTopicAssign.deleteMany({ propertyId: req.body.propertyId }); //delete all property assign topic
			let assignChecklistDelete = await MngRatingChecklistAssign.deleteMany({ propertyId: req.body.propertyId }); //delete all property assign topic
			
			for (let i = 0; i < req.body.groupId.length; i++) {
				// let MngRatingGroupMasterData = await MngRatingGroupMaster.find({ _id: req.body.groupId[i] });

				// store group wise topic list. 
				let ratingTopicIds = await MngRatingTopicMaster.find({ ratingGroupId: req.body.groupId[i], status: 1 }).distinct('_id'); //get only Ids in array
				if (ratingTopicIds.length > 0) {
					let topicAssignStore = await MngRatingTopicAssign.create({
						propertyId: req.body.propertyId,
						groupId: req.body.groupId[i],
						topicIds: ratingTopicIds,
						// auditorId: req.body.auditorId
					})
				}
	
				// store topic wise checklist. 
				let checklistIds = await MngRatingChecklistMaster.find({ ratingGroupId: req.body.groupId[i], status: 1 }).distinct('_id'); //get only Ids in array
				let checklistData = await MngRatingChecklistMaster.find({ ratingGroupId: req.body.groupId[i], status: 1 });
				if (checklistData.length > 0) {
					for (let k = 0; k < checklistData.length; k++) {
						let topicChecklistStore = await MngRatingChecklistAssign.create({
							propertyId: req.body.propertyId,
							ratingGroupId: checklistData[k].ratingGroupId,
							ratingTopicId: checklistData[k].ratingTopicId,
							checklistIds: checklistIds,
							// auditorId: req.body.auditorId,
						})
					}
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

exports.editGroupName = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Edit Group Name & Topic Name', session: req.session };

		let condition = { "$match": { ratingGroupId: ObjectId(req.params.id) } };
		let page = 1;
		if (req.query.page != undefined) {
			page = req.query.page;
		}
		let limit = { $limit: 10 };
		let skip = { $skip: (page - 1) * 10 };
		let project = {
			$project: {
				topicName: 1,
				status: 1
			}
		}
		let query1 = {};
		if (req.query.search) {
			query1['topicName'] = { $regex: new RegExp(req.query.search, 'i') };
		}
		let totalProperty = await MngRatingTopicMaster.count(query1);
		totalPage = Math.ceil(totalProperty / 10);

		let search = { "$match": { $or: [query1] } };
		let sort = {
			$sort: {
				createdAt: -1
			}
		};
		let topicData = await MngRatingTopicMaster.aggregate([condition, search, sort, skip, limit, project]);
		const groupDetails = await MngRatingGroupMaster.findOne({ _id: ObjectId(req.params.id) });
		return res.render('Admin/Manage-Rating/edit-group-name', { 'data': topicData, groupDetails: groupDetails, page: page, totalPage: totalPage, search: req.query.search ? req.query.search : "", groupId: req.params.id, 'message': req.flash('message'), 'error': req.flash('error') });
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.editTopic = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		res.locals = { title: 'Edit Topic & Checklists', session: req.session };

		let condition = { "$match": { ratingTopicId: ObjectId(req.params.id) } };
		let page = 1;
		if (req.query.page != undefined) {
			page = req.query.page;
		}
		let limit = { $limit: 10 };
		let skip = { $skip: (page - 1) * 10 };
		let project = {
			$project: {
				ratingGroupId: 1,
				ratingTopicId: 1,
				checklistTitle: 1,
				cueForAuditor: 1,
				weightage: 1,
				status: 1
			}
		}
		let query1 = {};
		if (req.query.search) {
			query1['checklistTitle'] = { $regex: new RegExp(req.query.search, 'i') };
		}
		let totalProperty = await MngRatingChecklistMaster.count(query1);
		totalPage = Math.ceil(totalProperty / 10);

		let search = { "$match": { $or: [query1] } };
		let sort = {
			$sort: {
				createdAt: -1
			}
		};
		let topicData = await MngRatingChecklistMaster.aggregate([condition, search, sort, skip, limit, project]);
		let topicDetails = await MngRatingTopicMaster.findOne({ _id: ObjectId(req.params.id) }).populate({ "path": "ratingGroupId" });
		return res.render('Admin/Manage-Rating/edit-topic', { 'data': topicData, topicDetails: topicDetails, page: page, totalPage: totalPage, search: req.query.search ? req.query.search : "", groupId: req.params.id, 'message': req.flash('message'), 'error': req.flash('error') });

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Update group status
exports.updateGroupStatus = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			grpId: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let ratingGroup = await MngRatingGroupMaster.findOne({ _id: req.body.grpId });
		if (ratingGroup.status == 0) {
			ratingGroup.status = 1;
		} else {
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
exports.updateRatingTopicStatus = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			topicId: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let ratingTopic = await MngRatingTopicMaster.findOne({ _id: req.body.topicId });
		if (ratingTopic.status == 0) {
			ratingTopic.status = 1;
		} else {
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
exports.updateTopicChecklistStatus = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }
		let schema = Joi.object({
			topicChecklistId: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let ratingTopic = await MngRatingChecklistMaster.findOne({ _id: req.body.topicChecklistId });
		if (ratingTopic.status == 0) {
			ratingTopic.status = 1;
		} else {
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
exports.updateGroupName = async (req, res) => {
	try {
		let groupNameData = await MngRatingGroupMaster.findOne({ groupName: req.body.group_name });
		if (!groupNameData) {
			let groupNameData = await MngRatingGroupMaster.updateOne({ _id: req.body.group_id }, { groupName: req.body.group_name });
		} else {
			req.flash('error', 'Group name already exists!');
			return res.redirect('back');
		}
		req.flash('message', 'Group name is updated!');
		return res.redirect('edit-group-name/' + req.body.group_id);
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		req.flash('error', 'Something want wrong');
		return res.redirect('back');
	}
}

// Update topic name
exports.updateTopicName = async (req, res) => {
	try {
		let topicNameData = await MngRatingTopicMaster.findOne({ topicName: req.body.topic_name });
		if (!topicNameData) {
			let topicNameData = await MngRatingTopicMaster.updateOne({ _id: req.body.topic_id }, { topicName: req.body.topic_name });
		} else {
			req.flash('error', 'Topic name already exists!');
			return res.redirect('back');
		}
		req.flash('message', 'Topic name is updated!');
		return res.redirect('edit-topic/' + req.body.topic_id);
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		req.flash('error', 'Something want wrong');
		return res.redirect('back');
	}
}

// Update topic name
exports.assignGroupList = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.required()
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let propertyData = await Property.findOne({ _id: req.query.propertyId }, { property_name: 1 });
		if (!propertyData) {
			return res.status(200).send({ "status": false, "status_code": "200" });
		}

		let usedGroup = await MngRatingGroupAssign.distinct("groupId", { propertyId: req.query.propertyId });
		let assignedGroupList = await MngRatingGroupMaster.find({ _id: { $in: usedGroup }, status: 1 });
		let allGroupList = await MngRatingGroupMaster.find({ status: 1 });

		return res.status(200).send({
			"status": true,
			allGroupList: allGroupList,
			assignedGroupList: assignedGroupList,
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// assign Rating Task
exports.assignRatingTask = async (req, res) => {
	try {
		if (!req.session.user) { return res.redirect('/login'); }

		let assignPropertyIds = await MngRatingGroupAssign.distinct('propertyId');
		// assignPropertyIds = assignPropertyIds.map((i) => String(i));

		let data = [];
		for (let i = 0; i < assignPropertyIds.length; i++) {
			let assignGroupsData = await MngRatingGroupAssign.findOne({propertyId: assignPropertyIds[i]});
			let assignTopicsData = await MngRatingTopicAssign.findOne({propertyId: assignPropertyIds[i]});
			let assignChecklistData = await MngRatingChecklistAssign.findOne({propertyId: assignPropertyIds[i]});
			
			let taskObj = new MngRatingTaskAssign();
			taskObj.propertyId = assignGroupsData.propertyId;
			taskObj.auditorId = assignGroupsData.auditorId;

			let assignGroupsArray = [];
			let totalWeightage = 0;
			for (let j = 0; j < assignGroupsData.groupIds.length; j++) {	

				let assignTopicsArray = []
				for (let k = 0; k < assignTopicsData.topicIds.length; k++) {

					let assignChecklistsArray = []
					for (let l = 0; l < assignChecklistData.checklistIds.length; l++) {
						let checklistData = await MngRatingChecklistMaster.findOne({_id: assignChecklistData.checklistIds[j]})
						totalWeightage = totalWeightage + checklistData.weightage ? checklistData.weightage : 0
						assignChecklistsArray.push({
							checklistId: assignChecklistData.checklistIds[j],
							weightage: checklistData.weightage ? checklistData.weightage : 0,
							point: 0
						})
					}
					assignTopicsArray.push({
						topicId: assignTopicsData.topicIds[j],
						assignChecklists: assignChecklistsArray
					})
				}
				assignGroupsArray.push({
					groupId: assignGroupsData.groupIds[j],
					assignTopics: assignTopicsArray
				})
			}
			taskObj.assignGroups = assignGroupsArray;
			taskObj.totalWeightage = totalWeightage;
			taskObj.totalPoint = 0;
			taskObj.totalPercentage = 0;

			await taskObj.save();
			data.push(taskObj);
		}

		return res.status(200).send({
			"status": true,
			data: assignPropertyIds,
			data2: data
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// assign Rating Task
exports.viewGroupAssignTask = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.required()
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let assignPropertyGroupData = await MngRatingGroupAssign.findOne({propertyId: req.query.propertyId}).populate({path: 'groupIds'});

		console.log(assignPropertyGroupData);

		// if (assignPropertyGroupData) {
		// 	let assignGroupList = await MngRatingGroupAssign.findOne({propertyId: req.query.propertyId});
		// }

		// let data = [];
		// for (let i = 0; i < assignPropertyIds.length; i++) {
		// 	let assignGroupsData = await MngRatingGroupAssign.findOne({propertyId: assignPropertyIds[i]});
		// 	let assignTopicsData = await MngRatingTopicAssign.findOne({propertyId: assignPropertyIds[i]});
		// 	let assignChecklistData = await MngRatingChecklistAssign.findOne({propertyId: assignPropertyIds[i]});
			
		// 	let taskObj = new MngRatingTaskAssign();
		// 	taskObj.propertyId = assignGroupsData.propertyId;
		// 	taskObj.auditorId = assignGroupsData.auditorId;

		// 	let assignGroupsArray = [];
		// 	let totalWeightage = 0;
		// 	for (let j = 0; j < assignGroupsData.groupIds.length; j++) {	

		// 		let assignTopicsArray = []
		// 		for (let k = 0; k < assignTopicsData.topicIds.length; k++) {

		// 			let assignChecklistsArray = []
		// 			for (let l = 0; l < assignChecklistData.checklistIds.length; l++) {
		// 				let checklistData = await MngRatingChecklistMaster.findOne({_id: assignChecklistData.checklistIds[j]})
		// 				totalWeightage = totalWeightage + checklistData.weightage ? checklistData.weightage : 0
		// 				assignChecklistsArray.push({
		// 					checklistId: assignChecklistData.checklistIds[j],
		// 					weightage: checklistData.weightage ? checklistData.weightage : 0,
		// 					point: 0
		// 				})
		// 			}
		// 			assignTopicsArray.push({
		// 				topicId: assignTopicsData.topicIds[j],
		// 				assignChecklists: assignChecklistsArray
		// 			})
		// 		}
		// 		assignGroupsArray.push({
		// 			groupId: assignGroupsData.groupIds[j],
		// 			assignTopics: assignTopicsArray
		// 		})
		// 	}
		// 	taskObj.assignGroups = assignGroupsArray;
		// 	taskObj.totalWeightage = totalWeightage;
		// 	taskObj.totalPoint = 0;
		// 	taskObj.totalPercentage = 0;

		// 	await taskObj.save();
		// 	data.push(taskObj);
		// }

		return res.status(200).send({
			"status": true,
			data: 'assignPropertyIds',
			data2: 'data'
		});
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}