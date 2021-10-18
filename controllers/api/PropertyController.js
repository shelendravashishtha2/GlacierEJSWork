const Property = require("../../models/Property");
const fs = require('fs')
const path = require('path');
const bcrypt = require("bcryptjs");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {errorLog} = require("../../helper/consoleLog");
const UserResource = require('../resources/UserResource');
const Joi = require("joi");

exports.propertyList = async (req,res) => {
	try {
		let propertyData = await Property.find({});
		return res.send(response.success(200, 'success', PropertyResource(propertyData)));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}