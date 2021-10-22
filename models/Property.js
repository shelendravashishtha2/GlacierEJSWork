const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {errorLog} = require("../helper/consoleLog");
const Joi = require("joi");

const propertySchema = new mongoose.Schema({
	property_name: {
		type: String,
		trim: true,
		unique: true
	},
	address: {
		type: String,
		trim: true,
	},
	location: {
		type: String,
		trim: true,
	},
	propertyLatLong: {
        type: [Number],
        index: '2d'
    },
	property_images: {
		type: [String],
		trim: true,
	},
	name_of_owner: {
		type: String,
		trim: true,
	},
	area_name: {
		type: String,
		trim: true,
	},
	square_feet: {
		type: String,
		trim: true,
	},
	wings: {
		type: [String],
		trim: true,
	},
	status: {
		type: Number, // 1=active, 0=Inactive
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 1,
	},
	created_at: {
		type: Date,
		default: Date.now,
		select: false
	},
	updated_at: {
		type: Date,
		default: Date.now,
		select: false
	}
});

const Property = new mongoose.model("Property", propertySchema);
module.exports = Property;