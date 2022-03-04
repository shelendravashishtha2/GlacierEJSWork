const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const daysEnum = require("../enum/daysEnum");
const frequencyEnum = require("../enum/frequencyEnum");
const { prependToArray } = require("../helper/commonHelpers");
const User = require("./User");

let daysArr = Object.keys(daysEnum);
let days = prependToArray('',daysArr);
let frequencyArr = Object.keys(frequencyEnum);

const assetSchema = new mongoose.Schema({ 
	assetName: {
		type: String,
		required:true,
		trim: true,
	},
	vendorName: {
		type: String,
		required:true,
		trim: true,
	},
	frequency: {
		type: String,
		enum: frequencyArr,
		required:true,
		trim: true,
	},
	month: {
		type: Number,
		min: [1,'invalid status'],
    	max: [12,'invalid status'],
		trim: true,
	},
	date: {
		type: Number,
		min: [1,'invalid status'],
    	max: [31,'invalid status'],
		trim: true,
	},
	day: {
		type: String,
		enum: days,
		trim: true,
		default: '',
	},
	
	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1,
	},
	createdBy: {type: mongoose.Schema.Types.ObjectId, ref: User, select: false},
	updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: User, select: false},
	createdAt: {type: Date, default: Date.now, select: false},
	updatedAt: {type: Date, default: Date.now, select: false}
});

const PpmEquipmentMasterSchema = new mongoose.Schema({
	ppmEquipmentName: {
		type: String,
		required:true,
		trim: true,
		unique: true
	},
	assets: [assetSchema],

	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1,
	},
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: User, select: false },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: User, select: false },
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	timestamps: true,
	versionKey: false
});

PpmEquipmentMasterSchema.plugin(mongoosePaginate);

const PpmEquipmentMaster = new mongoose.model("Ppm_Equipment_Master", PpmEquipmentMasterSchema);
module.exports = PpmEquipmentMaster;