const User = require("../../models/User");
const Property = require("../../models/Property");
const fs = require('fs')
const path = require('path');
const bcrypt = require("bcryptjs");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {errorLog} = require("../../helper/consoleLog");
const PropertyResource = require('../resources/PropertyResource');
const Joi = require("joi");

// Property add form validatation
exports.propertyAddValidation = async (req, res, next) => {
	
	if (!Array.isArray(req.body.wings)) {
	}

	const schema = Joi.object({
		property_name: Joi.string().min(8).max(300).required(),
		address: Joi.string().min(15).max(300).required(),
		location: Joi.string().min(6).max(200).required(),
		name_of_owner: Joi.string().min(6).max(200).required(),
		area_name: Joi.string().min(6).max(300).required(),
		square_feet: Joi.string().min(6).max(200).required(),
		wings: Joi.array().items(Joi.string().allow('',null).trim(true)),
		property_images: Joi.array().items(Joi.string().allow('',null).trim(true)),
	});
	const validation = schema.validate(req.body, __joiOptions);
	if (validation.error) {
		return res.send(response.error(400, validation.error.details[0].message, [] ));
	} else {
		next();
	}
}

// Property add api
exports.propertyAdd = async (req, res) => {
	try {
		const existsUser = await Property.findOne({ property_name: req.body.property_name });
		if(existsUser) {
			return res.send(response.error(400, 'Property name already exists', [] ));
		}
		let propertyImageNameArray = [];
		let wingsNameArray = [];
		
		if (req.files && req.files.property_images) {
			let property_images = req.files.property_images;
			let uploadPath = __basedir + '/public/images/property/';

			if (Array.isArray(property_images)) {
				property_images.forEach(pro_image => {
					if (pro_image.mimetype !== "image/png" && pro_image.mimetype !== "image/jpg" && pro_image.mimetype !== "image/jpeg"){
						return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
					}
					if (pro_image.size >= (1024 * 1024 * 5)) { // if getter then 5MB
						return res.send(response.error(400, 'Image must be less then 5MB', []));
					}
				});
				property_images.forEach(pro_image => {
					let randomNumber = Math.floor(Math.random() * 100) + 1; //0-99 random number
					fileName = 'property-image-' + Date.now() + randomNumber + path.extname(pro_image.name);
					pro_image.mv(uploadPath + fileName, function(err) {
						if (err){
							return res.send(response.error(400, 'Image uploading failed', []));
						}
					});
					propertyImageNameArray.push('/public/images/property/' + fileName);
				});
			}
		}else{
			return res.send(response.error(400, 'File is required', []));
		}
		
		if (req.body.wings) {
			let wings = req.body.wings;
			if (Array.isArray(wings)) {
				wings.forEach(wing => {
					wingsNameArray.push(wing);
				});
			}
		}else{
			return res.send(response.error(400, 'Wing is required', []));
		}

		const obj = new Property({
			property_name: req.body.property_name,
			address: req.body.address,
			location: req.body.location,
            name_of_owner: req.body.name_of_owner,
            area_name:req.body.area_name,
			square_feet: req.body.square_feet,
			property_images:propertyImageNameArray,
			wings:wingsNameArray,
		});
		const propertyData = await obj.save();
		res.locals = { title: 'Propertys'};
		let propertysData = await Property.find({});
		return res.render('Admin/Propertys/index',{'data':PropertyResource(propertysData)});
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

// Property List Page
exports.propertyList = async (req,res) => {
	try {
		res.locals = { title: 'Propertys'};
		let propertyData = await Property.find({});
		return res.render('Admin/Propertys/index',{'data':PropertyResource(propertyData)});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Property Create Page
exports.propertyCreate = async (req,res) => {
	try {
		res.locals = { title: 'Create Property'};
		let propertyData = await Property.find({});
		return res.render('Admin/Propertys/create',{'data':PropertyResource(propertyData)});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Property Update Page
exports.propertyUpdate = async (req,res) => {
	try {
		res.locals = { title: 'Update Property'};
		let propertyData = await Property.find({});
		return res.render('Admin/Propertys/edit',{'data':PropertyResource(propertyData)});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// Property View Page
exports.propertyView = async (req,res) => {
	try {
		res.locals = { title: 'View Property'};
		let propertyData = await Property.find({_id:req.params.id});
		return res.render('Admin/Propertys/view',{'data':PropertyResource(propertyData)});

	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}