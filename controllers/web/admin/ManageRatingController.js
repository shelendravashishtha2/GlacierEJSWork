const { check, sanitizeBody, validationResult, matchedData } = require('express-validator');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { Validator } = require('node-input-validator');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../../../models/User");
const Property = require("../../../models/Property");
const MngRatingGroupMaster = require("../../../models/MngRatingGroupMaster");
const MngRatingTopicMaster = require("../../../models/MngRatingTopicMaster");
const MngRatingChecklistMaster = require("../../../models/MngRatingChecklistMaster");
const MngRatingGroupAssign = require("../../../models/MngRatingGroupAssign");
const MngRatingTopicAssign = require("../../../models/MngRatingTopicAssign");
const MngRatingChecklistAssign = require("../../../models/MngRatingChecklistAssign");
const response = require("../../../helper/response");
const PropertyResource = require('../../api/resources/PropertyResource');
const MngRatingAssignChecklistPoint = require("../../../models/MngRatingAssignChecklistPoint");
const SettingRating = require("../../../models/SettingRating");

// Manage Rating List Page
exports.manageRatingList = async (req, res) => {
	try {
		res.locals.title = 'Manage Rating';
		res.locals.session = req.session;

		let findQuery = { status: 1 }
		if (req.query.search) {
			findQuery.property_name = { $regex: new RegExp(req.query.search, 'i') }
		};
		let options = {
			populate: [{path: 'propertyId'}, {path: 'auditorId'}],
			lean: true,
			page: req.query.page ? Math.max(1, req.query.page) : 1,
			limit: 10
		};
		let propertyData = await MngRatingGroupAssign.paginate(findQuery, options);

		for (let i = 0; i < propertyData.docs.length; i++) {
			const propertyDetails = propertyData.docs[i];
			let totalWeightage = 0.0;
			let totalPoint = 0.0;

			let MngRatingChecklistAssignData = await MngRatingChecklistAssign.find({propertyId: propertyDetails.propertyId._id}).populate({path: 'checklistIds'}).sort({createdAt: -1}).lean();
			let MngRatingAssignChecklistPointData = await MngRatingAssignChecklistPoint.find({propertyId: propertyDetails.propertyId._id}).sort({createdAt: -1});

			for (let j = 0; j < MngRatingChecklistAssignData.length; j++) {
				if (MngRatingChecklistAssignData[j].checklistIds == undefined) {
					for (let k = 0; k < MngRatingChecklistAssignData[j].checklistIds.length; k++) {
						const element = MngRatingChecklistAssignData[k].checklistIds[k];
						if (element) {
							totalWeightage = totalWeightage + element.weightage;
							for (let l = 0; l < MngRatingAssignChecklistPointData.length; l++) {
								const element2 = MngRatingAssignChecklistPointData[l];
								if (String(element2.checklistId) == String(MngRatingChecklistAssignData[k].checklistIds[k]._id)) {
									totalPoint = totalPoint + element2.point;
								}
							}
						}
					}
				}
			}
			propertyDetails.totalWeightage = totalWeightage;
			propertyDetails.totalPoint = totalPoint;
			propertyDetails.per = ((totalPoint * 100) / (totalWeightage ? totalWeightage : 1)).toFixed(2);

			let SettingRatingData = await SettingRating.findOne({min_rating: {$lte: propertyDetails.per}, max_rating: {$gte: propertyDetails.per}});
			if (SettingRatingData) {
				propertyDetails.rating = SettingRatingData.rating_name
			} else {
				propertyDetails.rating = '--'
			}
		}

		return res.render('Admin/Manage-Rating/index', {
			propertyData: propertyData,
			search: req.query.search,
			success: req.flash('success_msg'),
			error: req.flash('error_msg'),
		})
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Add new group
exports.addGroup = async (req, res) => {
	try {
		res.locals.title = 'Group Add';
		res.locals.session = req.session;

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

		req.flash('success_msg', 'Group is added!');
		return res.redirect(req.baseUrl+'/group-list');
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error_msg', errorMessage.message);
			return res.redirect(req.baseUrl+'/group-list');
		} else {
			errorLog(error, __filename, req.originalUrl);
			req.flash('error_msg', 'Something want wrong');
			return res.redirect(req.baseUrl+'/group-list');
		}
	}
}

exports.addTopic = async (req, res) => {
	try {
		res.locals.title = 'Topic Add';
		res.locals.session = req.session;

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

		req.flash('success_msg', 'Topic is added!');
		return res.redirect(req.baseUrl+'/edit-group-name/' + req.body.groupId);
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error_msg', errorMessage.message);
			return res.redirect('back');
		} else {
			errorLog(error, __filename, req.originalUrl);
			req.flash('error_msg', 'Something want wrong');
			return res.redirect('back');
		}
	}
}

exports.addTopicChecklist = async (req, res) => {
	try {
		res.locals.title = 'Topic Checklist Add';
		res.locals.session = req.session;

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
		req.flash('success_msg', message);
		return res.redirect(req.baseUrl+'/edit-topic/' + req.body.ratingTopicId);
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error_msg', errorMessage.message);
			return res.redirect('back');
		} else {
			errorLog(error, __filename, req.originalUrl);
			req.flash('error_msg', 'Something want wrong');
			return res.redirect('back');
		}
	}
}

exports.assignAuditor = async (req, res) => {
	try {
		res.locals.title = 'Assign Auditor - Manage Rating';
		res.locals.session = req.session;

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
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.storeAssignAuditor = async (req, res) => {
	try {
		res.locals.title = 'Store Assign Auditor';
		res.locals.session = req.session;

		req.body.groupId = Array.isArray(req.body.groupId) ? req.body.groupId : [req.body.groupId];

		const validate = new Validator(req.body, {
			propertyId: 'required',
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
			let assignAuditor = new MngRatingGroupAssign({
				propertyId: req.body.propertyId,
				groupIds: req.body.groupId,
				auditorId: req.body.auditorId,
			});
			await assignAuditor.save();
	
			for (let i = 0; i < req.body.groupId.length; i++) {	
				// store group wise topic list. 
				let ratingTopicIds = await MngRatingTopicMaster.find({ ratingGroupId: req.body.groupId[i], status: 1 }).distinct('_id'); //get only Ids in array
				if (ratingTopicIds.length > 0) {
					let topicAssignStore = await MngRatingTopicAssign.create({
						propertyId: req.body.propertyId,
						groupId: req.body.groupId[i],
						topicIds: ratingTopicIds,
					})

					// store topic wise checklist.
					for (let j = 0; j < ratingTopicIds.length; j++) {
						const ratingTopicId = ratingTopicIds[j];
						let checklistIds = await MngRatingChecklistMaster.find({ ratingGroupId: req.body.groupId[i], ratingTopicId: ratingTopicId, status: 1 }).distinct('_id'); //get only Ids in array
						await MngRatingChecklistAssign.create({
							propertyId: req.body.propertyId,
							ratingGroupId: req.body.groupId[i],
							ratingTopicId: ratingTopicId,
							checklistIds: checklistIds,
						})
					}
				}
			}
		}
		
		message = "Group is assigned";
		req.flash('success_msg', message);
		return res.redirect(req.baseUrl+'/manage-rating');
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error_msg', errorMessage.message);
			return res.redirect('back');
		} else {
			errorLog(error, __filename, req.originalUrl);
			req.flash('error_msg', 'Something want wrong');
			return res.redirect('back');
		}
	}
}

exports.groupList = async (req, res) => {
	try {
		res.locals.title = 'Manage Group';
		res.locals.session = req.session;

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

		return res.render('Admin/Manage-Rating/group-list', { 'data': groupData, page: page, totalPage: totalPage, search: req.query.search ? req.query.search : "", 'success': req.flash('success_msg'), 'error': req.flash('error_msg') });

	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.editGroup = async (req, res) => {
	try {
		res.locals.title = 'Edit Assign Group';
		res.locals.session = req.session;

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
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.updateAssignGroups = async (req, res) => {
	try {
		res.locals.title = 'Store Assign Auditor';
		res.locals.session = req.session;

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
			}, {new:true,runValidators:true});

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
		
		req.flash('success_msg', message);
		return res.redirect(req.baseUrl+'/manage-rating');
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			req.flash('error_msg', errorMessage.message);
			return res.redirect('back');
		} else {
			errorLog(error, __filename, req.originalUrl);
			req.flash('error_msg', 'Something want wrong');
			return res.redirect('back');
		}
	}
}

exports.editGroupName = async (req, res) => {
	try {
		res.locals.title = 'Edit Group Name & Topic Name';
		res.locals.session = req.session;

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
		return res.render('Admin/Manage-Rating/edit-group-name', { 'data': topicData, groupDetails: groupDetails, page: page, totalPage: totalPage, search: req.query.search ? req.query.search : "", groupId: req.params.id, 'success': req.flash('success_msg'), 'error': req.flash('error_msg') });
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.editTopic = async (req, res) => {
	try {
		res.locals.title = 'Edit Topic & Checklists';
		res.locals.session = req.session;

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
		return res.render('Admin/Manage-Rating/edit-topic', { 'data': topicData, topicDetails: topicDetails, page: page, totalPage: totalPage, search: req.query.search ? req.query.search : "", groupId: req.params.id, 'success': req.flash('success_msg'), 'error': req.flash('error_msg') });

	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Update group status
exports.updateGroupStatus = async (req, res) => {
	try {
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
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Update rating topic status
exports.updateRatingTopicStatus = async (req, res) => {
	try {
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
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
// Update topic checklist status
exports.updateTopicChecklistStatus = async (req, res) => {
	try {
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
		errorLog(error, __filename, req.originalUrl);
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
			req.flash('error_msg', 'Group name already exists!');
			return res.redirect('back');
		}
		req.flash('success_msg', 'Group name is updated!');
		return res.redirect(req.baseUrl+'/edit-group-name/' + req.body.group_id);
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		req.flash('error_msg', 'Something want wrong');
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
			req.flash('error_msg', 'Topic name already exists!');
			return res.redirect('back');
		}
		req.flash('success_msg', 'Topic name is updated!');
		return res.redirect(req.baseUrl+'/edit-topic/' + req.body.topic_id);
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		req.flash('error_msg', 'Something want wrong');
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
		errorLog(error, __filename, req.originalUrl);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// assign Rating Task
exports.viewGroupAssignTask = async (req, res) => {
	try {
		res.locals.title = 'Manage Rating';
		res.locals.session = req.session;

		let schema = Joi.object({
			propertyId: Joi.required(),
			groupId: Joi.optional()
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let assignPropertyGroupData = await MngRatingGroupAssign.findOne({propertyId: req.query.propertyId}).populate({path: 'groupIds'}).populate({path: 'auditorId'});
		let MngRatingTopicAssignData;
		let MngRatingChecklistAssignData;
		let MngRatingAssignChecklistPointData;
		let MngRatingTopicAssignDataArray = [];

		if (req.query.groupId) {
			MngRatingTopicAssignData = await MngRatingTopicAssign.findOne({propertyId: req.query.propertyId, groupId: req.query.groupId}).populate({path: 'groupId'}).populate({path: 'topicIds'}).lean();
			MngRatingChecklistAssignData = await MngRatingChecklistAssign.find({propertyId: req.query.propertyId, ratingGroupId: req.query.groupId}).populate({path: 'ratingTopicId'}).populate({path: 'checklistIds'}).lean();
			MngRatingAssignChecklistPointData = await MngRatingAssignChecklistPoint.find({propertyId: req.query.propertyId}).sort({createdAt: -1}).lean();

			if (MngRatingTopicAssignData.topicIds != null) {
				for (let i = 0; i < MngRatingTopicAssignData.topicIds.length; i++) {
					const element1 = MngRatingTopicAssignData.topicIds[i]; //topic id 
					let totalWeightage = 0;
					let totalPoint = 0;
					for (let j = 0; j < MngRatingChecklistAssignData.length; j++) {
						const element2 = MngRatingChecklistAssignData[j];
						for (let k = 0; k < MngRatingChecklistAssignData[j].checklistIds.length; k++) {
							const element3 = MngRatingChecklistAssignData[j].checklistIds[k];
							if (String(element1._id) == String(element3.ratingTopicId)) {
								totalWeightage = totalWeightage + element3.weightage;
								for (let l = 0; l < MngRatingAssignChecklistPointData.length; l++) {
									const element4 = MngRatingAssignChecklistPointData[l];
									if (String(element3._id) == String(element4.checklistId)) {
										element3.point = element4.point;
										totalPoint = totalPoint + element4.point;
										break;
									} else {
										element3.point = 0
									}
								}
							}
							
						}
					}
					element1.weightage = totalWeightage;
					element1.point = totalPoint;
				}
			}
			MngRatingTopicAssignDataArray.push(MngRatingTopicAssignData)
		} else {
			assignGroupData = await MngRatingGroupAssign.findOne({propertyId: req.query.propertyId});
			MngRatingAssignChecklistPointData = await MngRatingAssignChecklistPoint.find({propertyId: req.query.propertyId}).sort({createdAt: -1}).lean();

			for (let z = 0; z < assignPropertyGroupData.groupIds.length; z++) {
				req.query.groupId = assignPropertyGroupData.groupIds[z];
				
				MngRatingTopicAssignData = await MngRatingTopicAssign.findOne({propertyId: req.query.propertyId, groupId: req.query.groupId}).populate({path: 'groupId'}).populate({path: 'topicIds'}).lean();
				MngRatingChecklistAssignData = await MngRatingChecklistAssign.find({propertyId: req.query.propertyId, ratingGroupId: req.query.groupId}).populate({path: 'ratingTopicId'}).populate({path: 'checklistIds'}).lean();

				if (MngRatingTopicAssignData.topicIds != null) {
					for (let i = 0; i < MngRatingTopicAssignData.topicIds.length; i++) {
						const element1 = MngRatingTopicAssignData.topicIds[i]; //topic id 
						let totalWeightage = 0;
						let totalPoint = 0;
						for (let j = 0; j < MngRatingChecklistAssignData.length; j++) {
							const element2 = MngRatingChecklistAssignData[j];
							for (let k = 0; k < MngRatingChecklistAssignData[j].checklistIds.length; k++) {
								const element3 = MngRatingChecklistAssignData[j].checklistIds[k];
								if (String(element1._id) == String(element3.ratingTopicId)) {
									totalWeightage = totalWeightage + element3.weightage;
									for (let l = 0; l < MngRatingAssignChecklistPointData.length; l++) {
										const element4 = MngRatingAssignChecklistPointData[l];
										if (String(element3._id) == String(element4.checklistId)) {
											element3.point = element4.point;
											totalPoint = totalPoint + element4.point;
											break;
										} else {
											element3.point = 0
										}
									}
								}
								
							}
						}
						element1.weightage = totalWeightage;
						element1.point = totalPoint;
					}
				}
				MngRatingTopicAssignDataArray.push(MngRatingTopicAssignData)
			}
		}

		// console.log(MngRatingTopicAssignDataArray);
		// console.log(MngRatingTopicAssignData);

		return res.render('Admin/Manage-Rating/assign-auditor-task-list', {
			data: {propertyId: req.query.propertyId, groupId: req.query.groupId },
			assignPropertyGroupData: assignPropertyGroupData,
			MngRatingTopicAssignData: MngRatingTopicAssignDataArray,
			page: 1,
			totalPages: 1,
			search: req.query.search ? req.query.search : "",
			success: req.flash('success_msg'),
			error: req.flash('error_msg')
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		// return res.status(500).send('123')
		return res.redirect('back');
	}
}

// view Assign Task Checklist
exports.viewAssignTaskChecklist = async (req, res) => {
	try {
		res.locals.title = 'Manage Rating';
		res.locals.session = req.session;

		let schema = Joi.object({
			propertyId: Joi.required(),
			groupId: Joi.required(),
			topicId: Joi.required(),
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		let MngRatingChecklistAssignData = await MngRatingChecklistAssign.findOne({propertyId: req.query.propertyId, ratingGroupId: req.query.groupId, ratingTopicId: req.query.topicId}).populate({path: 'checklistIds'}).lean();
		let MngRatingAssignChecklistPointData = await MngRatingAssignChecklistPoint.find({propertyId: req.query.propertyId}).sort({createdAt: -1}).lean();

		if (MngRatingChecklistAssignData) {
			for (let i = 0; i < MngRatingChecklistAssignData.checklistIds.length; i++) {
				const element = MngRatingChecklistAssignData.checklistIds[i];
				for (let j = 0; j < MngRatingAssignChecklistPointData.length; j++) {
					const element2 = MngRatingAssignChecklistPointData[j];
					if (String(element._id) == String(element2.checklistId)) {
						element.point = element2.point
						element.MngRatingAssignChecklistPointData = element2
						break;
					}
				}
				if (element.point == undefined) {
					element.point = '-'
				}
			}
		}

		return res.render('Admin/Manage-Rating/assign-auditor-task-checklist-details', {
			data: {propertyId: req.query.propertyId, groupId: req.query.groupId },
			MngRatingChecklistAssignData: MngRatingChecklistAssignData, //.checklistIds
			page: 1,
			totalPage: 1,
			search: req.query.search ? req.query.search : "",
			success: req.flash('success_msg'),
			error: req.flash('error_msg')
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		errorMessage = "Something want wrong";
		req.session.error = { errorMessage: errorMessage, inputData: req.body };
		return res.redirect('back');
	}
}

// view Assign Task Checklist
exports.storeAssignChecklistPoint = async (req, res) => {
	try {
		res.locals.title = 'Manage Rating';
		res.locals.session = req.session;

		// let schema = Joi.object({
		// 	propertyId: Joi.required(),
		// 	auditorId: Joi.required(),
		// 	checklistId: Joi.required(),
		// 	point: Joi.required(),
		// 	remark: Joi.required(),
		// });
		// let validation = schema.validate(req.query, __joiOptions);
		// if (validation.error) {
		// 	return res.send(response.error(400, validation.error.details[0].message, []));
		// }

		let MngRatingAssignChecklistPointData = await MngRatingAssignChecklistPoint.create({
			propertyId: req.body.propertyId ? req.body.propertyId :'61cc02504c9ae4b9a0baa229',
			auditorId: req.body.auditorId ? req.body.auditorId :'61cab8ff09a0e36f4e7bc2f8',
			checklistId: req.body.checklistId ? req.body.checklistId :'6202326e87f9ca9e95ced0af',
			weightage: req.body.weightage ? req.body.weightage : 1.0,
			point: req.body.point ? req.body.point : 0.5,
			remark: req.body.remark ? req.body.remark : 'test',
			attachPhotos: []
		});

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "Data",
		    data: MngRatingAssignChecklistPointData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}