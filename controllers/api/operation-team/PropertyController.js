const Property = require("../../../models/Property");
const SettingRating = require("../../../models/SettingRating");
const fs = require('fs')
const path = require('path');
const bcrypt = require("bcryptjs");
const response = require("../../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {errorLog} = require("../../../helper/consoleLog");
const PropertyResource = require('../resources/PropertyResource');
const Joi = require("joi");
const UserProperty = require('../../../models/UserProperty');
const CategoryAssign = require('../../../models/CategoryAssign');
const CategoryFrcAssign = require('../../../models/CategoryFrcAssign');

exports.propertyList = async (req, res) => {
	try {
		let propertyIds = [];
		for(let i=0;i < req.user.property_id.length;i++){
			propertyIds.push(ObjectId(req.user.property_id[i]));
		}
		let condition = {"$match": {_id: {$in:propertyIds}}};
		let project = {
			$project:{
				property_name:"$property_name",
				rating:{ $ifNull: [ "$rating", 0 ] }
			}
		}
		let propertyList = await Property.aggregate([condition,project]);
		let settingRatingData = await SettingRating.find({});
		for(let i=0;i<propertyList.length;i++){
			if(propertyList[i].rating != 0){
				let index = settingRatingData.findIndex((x)=> propertyList[i].rating >= x.min_rating && propertyList[i].rating <= x.max_rating)
				if(index != -1){
					propertyList[i].rating = settingRatingData[i].rating_name; 
				}else{
					propertyList[i].rating = "E";
				}
			}else{
				propertyList[i].rating = "Not Given";
			}
		}
		return res.status(200).send({
		    "status": true,
		    "status_code": "200",
		    "message": "Property list with rating",
		    data: propertyList
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.propertyDetail = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let property = await Property.findOne({_id: req.body.propertyId})
		if(!property){
			return res.send(response.error(400, 'Property Not Found', []));
		}
		let wings = [];
		for(let i=0;i<property.wings.length;i++){
			if(property.wings[i].status == 1){
				wings.push(property.wings[i].wings_name);
			}
		}

		let UserPropertyData = await UserProperty.find({propertyId: req.body.propertyId}).populate({path: 'userId', select: ['full_name', 'position_id']});
		let CategoryAssignData = await CategoryAssign.find({propertyId: req.body.propertyId}).populate({path: 'categoryId', select: ['category_name']});
		let CategoryFrcAssignData = await CategoryFrcAssign.find({propertyId: req.body.propertyId}).select(['checklist_name']);

		const UserData = UserPropertyData.filter(item => item.userId != null).map((item) => item.userId)
		const OperationTeam = UserData.filter((item) => item.position_id == 2)
		const Auditor = UserData.filter((item) => item.position_id == 3)
		const Manager = UserData.filter((item) => item.position_id == 4)
		const Supervisor = UserData.filter((item) => item.position_id == 5)

		const CategoryData = CategoryAssignData.map((item) => item.categoryId)

		let responseArray = [{
			PropertyDetails: {
				property_name: property.property_name,
		    	name_of_owner: property.name_of_owner,
		    	square_feet: property.square_feet,
		    	area_name: property.area_name,
		    	property_images: property.property_images,
		    	address: property.address,
		    	wings: wings.join(","),
			},
			UsersDetails: {
				OperationTeam : OperationTeam,
				Auditor : Auditor,
				Manager : Manager,
				Supervisor : Supervisor,
			},
			Category: CategoryData,
			FrcList: CategoryFrcAssignData
		}]

		return res.status(200).send({
		    "status": true,
			"status_code": "200",
			"message": "Property details",
			"urlPath": process.env.APP_URL,
		    data: responseArray
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.propertyWingList = async (req, res) => {
	try {
		let propertyIds = [];
		if(req.user.position_id == 2){ // Operation teams
			let schema = Joi.object({
				propertyId: Joi.string().min(24).max(24).required()
			});
			let validation = schema.validate(req.body, __joiOptions);
			if (validation.error) {
				return res.send(response.error(400, validation.error.details[0].message, [] ));
			}
			for(let i=0;i < req.body.propertyId.length;i++){
				propertyIds.push(ObjectId(req.body.propertyId));
			}
		}else{
			for(let i=0;i < req.user.property_id.length;i++){
				propertyIds.push(ObjectId(req.user.property_id[i]));
			}
		}
		
		let condition = {"$match": {_id: {$in:propertyIds} , status:1}};
		let wingCondition = {"$match": {"wings.status": {$ne:0}}};
		let unwind = {
            $unwind: {
                path: "$wings",
                preserveNullAndEmptyArrays: true
            }
		}
        let group = {
			$group:{
				_id:"$_id",
				property_name:{$first:"$property_name"},
				wings:{
					$push:{
						_id:"$wings._id",
						wingsName:"$wings.wings_name",
						status:"$wings.status",
					}
				}
			}
		}
		
		let wingsData = await Property.aggregate([condition,unwind,wingCondition,group]);
		return res.status(200).send({
		    "status": true,
			"status_code": "200",
			"message": "Property wing list",
		    data: wingsData
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}