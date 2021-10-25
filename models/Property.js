const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {errorLog} = require("../helper/consoleLog");
const Joi = require("joi");

const wingsSchema = new mongoose.Schema({ 
	wings_name: {
		type: String,
		trim: true,
	}
});

const propertySchema = new mongoose.Schema({
	property_name: {
		type: String,
		required:true,
		trim: true,
		unique: true
	},
	address: {
		type: String,
		required:true,
		trim: true,
	},
	location: {
		type: String,
		trim: true,
	},
	propertyLatLong: {
        type: [Number],
        required:true,
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
	wings:[wingsSchema],
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