const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const path = require("path");
const response = require("../../../helper/response");
const MngRatingGroupAssign = require("../../../models/MngRatingGroupAssign");
const MngRatingTopicMaster = require("../../../models/MngRatingTopicMaster");
const MngRatingChecklistMaster = require("../../../models/MngRatingChecklistMaster");
const MngRatingAssignChecklistPoint = require("../../../models/MngRatingAssignChecklistPoint");
const SettingRating = require("../../../models/SettingRating");
const Property = require("../../../models/Property");
const User = require("../../../models/User");

exports.propertyList = async (req, res) => {
	try {
		let propertyList = await Property.find({ _id: { $in: req.user.property_id } }).select('property_name rating').lean();

		let UserData = await User.find({ position_id: 3 }).select('_id full_name property_id').lean();

		let settingRatingData = await SettingRating.find({}).lean();

		for (let i = 0; i < propertyList.length; i++) {
			propertyList[i].rating = "--"; // Not Given
			propertyList[i].auditorList = [];
			if (propertyList[i].rating != 0) {
				let index = settingRatingData.findIndex((x) => propertyList[i].rating >= x.min_rating && propertyList[i].rating <= x.max_rating)
				if (index != -1) {
					propertyList[i].rating = settingRatingData[i].rating_name;
				}
			}
			
			for (let j = 0; j < UserData.length; j++) {
				if (UserData[j].property_id) {
					let findIndex = UserData[j].property_id.findIndex(item => String(item) == String(propertyList[i]._id));
					if (findIndex != -1) {
						// propertyList[i].auditorList.push({_id: UserData[j]._id, full_name: UserData[j].full_name});
						propertyList[i].auditorList.push(UserData[j].full_name);
					}
				}
			}
		}

		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"message": "Property list with rating",
			data: propertyList
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.groupList = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId } = req.body;

		let MngRatingGroupAssignData = await MngRatingGroupAssign.find({ propertyId: propertyId, status: 1 }).populate({ path: 'groupIds' });
		MngRatingGroupAssignData = MngRatingGroupAssignData.map(item => item.groupIds).filter(item => item != null)

		return res.status(200).send(response.success(200, 'Success', MngRatingGroupAssignData));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.topicList = async (req, res) => {
	try {
		let schema = Joi.object({
			groupId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { groupId } = req.body;

		let MngRatingTopicMasterData = await MngRatingTopicMaster.find({ ratingGroupId: groupId, status: 1 });

		return res.status(200).send(response.success(200, 'Success', MngRatingTopicMasterData));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.checklistList = async (req, res) => {
	try {
		let schema = Joi.object({
			topicId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { topicId } = req.body;

		let MngRatingChecklistMasterData = await MngRatingChecklistMaster.find({ ratingTopicId: topicId, status: 1 });

		return res.status(200).send(response.success(200, 'Success', MngRatingChecklistMasterData));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.checklistRatingSubmit = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
			checklistId: Joi.string().min(24).max(24).required(),
			point: Joi.string().required(),
			remark: Joi.string().required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, checklistId, point, remark } = req.body;

		let MngRatingChecklistMasterData = await MngRatingChecklistMaster.findOne({ _id: checklistId });
		if (!MngRatingChecklistMasterData) { return res.send(response.error(400, 'Checklist not found', [])); }

		if (MngRatingChecklistMasterData.weightage < point) {
			return res.send(response.error(400, 'rating point gater then weightage', []));
		}

		if (req.files) {
			let uploadPath = __basedir + '/public/uploads/rating_files/';
			let attachPhotosArray = [];

			if (req.files.attachPhotos) {
				let attachPhotos = req.files.attachPhotos;
				attachPhotos = Array.isArray(attachPhotos) ? attachPhotos : [attachPhotos]
				if (attachPhotos.length > 0) {
					attachPhotos.forEach(fileData => {
						if (fileData.mimetype !== "image/png" && fileData.mimetype !== "image/jpg" && fileData.mimetype !== "image/jpeg") {
							return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
						}
						if (fileData.size >= (1024 * 1024 * 50)) { // if getter then 50MB
							return res.send(response.error(400, 'Image must be less then 50MB', []));
						}
					});
					for (let i = 0; i < attachPhotos.length; i++) {
						const fileData = attachPhotos[i];
						let randomNumber = Math.floor(Math.random() * 100) + 1; //0-99 random number
						let fileName = 'rating-image-' + propertyId + '-' + Date.now() + randomNumber + path.extname(fileData.name);
						const uploadFile = () => {
							return new Promise((resolve, reject) => { //upload the file, then call the callback with the location of the file
								fileData.mv(uploadPath + fileName, function (error) {
									if (error) {
										reject(error)
										return res.send(response.error(400, 'Image uploading failed 1', []));
									}
									resolve('image uploaded successfully')
								});
							})
						}
						await uploadFile();
						attachPhotosArray.push(fileName);
					}
				}
			}

			req.body.attachPhotos = attachPhotosArray
			// console.log(attachPhotosArray,'attachPhotosArray');
		}

		let createData = new MngRatingAssignChecklistPoint;
		createData.propertyId = propertyId;
		createData.auditorId = req.user._id;
		createData.checklistId = checklistId;
		createData.weightage = MngRatingChecklistMasterData.weightage;
		createData.point = point;
		createData.percentage = (100 * point) / MngRatingChecklistMasterData.weightage;
		createData.remark = remark;
		createData.attachPhotos = req.body.attachPhotos;
		await createData.save();

		return res.status(200).send(response.success(200, 'Success', [createData]));
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ratingHistoryCategoryList = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
			startDate: Joi.required(),
			endDate: Joi.required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { startDate, endDate } = req.body;

		let findQuery = {
			// propertyId: {$in: req.user.property_id},
			propertyId: req.body.propertyId,
			createdAt: {
				$gte: moment(startDate, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(endDate, 'DD-MM-YYYY').endOf('day')
			}
		}
		// let ratingHistoryData = await MngRatingAssignChecklistPoint.find(findQuery).populate({path: 'checklistId', populate: {path: 'ratingGroupId ratingTopicId'}});
		let ratingHistoryData = await MngRatingAssignChecklistPoint.find(findQuery).populate({ path: 'checklistId', populate: [{ path: 'ratingGroupId', select: '_id groupName' }, { path: 'ratingTopicId', select: '_id topicName' }] });

		let groupData = ratingHistoryData.filter(item => item.checklistId && item.checklistId.ratingGroupId).map((item) => {
			let data = {
				_id: item.checklistId.ratingGroupId._id,
				groupName: item.checklistId.ratingGroupId.groupName,
				percentage: item.percentage
			}
			return data
		})

		let arrayData = [];
		for (const item of groupData) {
			let findIndex = arrayData.findIndex(obj => obj.groupName == item.groupName)
			if (findIndex != -1) {
				arrayData[findIndex].percentage = (arrayData[findIndex].percentage + item.percentage) / 2;
				arrayData[findIndex].percentage = parseFloat(arrayData[findIndex].percentage.toFixed(2));
			} else {
				arrayData.push(item)
			}
		}

		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"message": "Rating History",
			data: arrayData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ratingHistoryChecklist = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			groupId: Joi.string().min(24).max(24).required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, startDate, endDate, groupId } = req.body;

		let findQuery = {
			// propertyId: {$in: req.user.property_id},
			propertyId: propertyId,
			createdAt: {
				$gte: moment(startDate, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(endDate, 'DD-MM-YYYY').endOf('day')
			}
		}
		// let ratingHistoryData = await MngRatingAssignChecklistPoint.find(findQuery).populate({path: 'checklistId', populate: {path: 'ratingGroupId ratingTopicId'}});
		let ratingHistoryData = await MngRatingAssignChecklistPoint.find(findQuery).populate({ path: 'checklistId', populate: [{ path: 'ratingGroupId', select: '_id groupName', match: { _id: groupId } }, { path: 'ratingTopicId', select: '_id topicName' }] });

		ratingHistoryData = ratingHistoryData.filter(item => item.checklistId && item.checklistId.ratingGroupId && item.checklistId.ratingTopicId)

		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"message": "Rating History",
			data: ratingHistoryData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}