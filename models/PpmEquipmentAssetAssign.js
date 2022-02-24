const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const daysEnum = require("../enum/daysEnum");
const frequencyEnum = require("../enum/frequencyEnum");
const { prependToArray } = require("../helper/commonHelpers");

let daysArr = Object.keys(daysEnum);
let days = prependToArray('',daysArr);
let frequencyArr = Object.keys(frequencyEnum);

const PpmEquipmentAssetAssignSchema = new mongoose.Schema({
	propertyId: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Property',
		required:true
	},
	// ppmEquipmentId: {
	// 	type: mongoose.Schema.Types.ObjectId, ref: 'Ppm_Equipment_Master',
	// 	required:true,
	// },
	assignPpmEquipmentId: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Ppm_Equipment_Assign',
		required:true,
	},

	assetName: {
		type: String,
		required: true,
		trim: true,
	},
	assetLocation: {
		type: String,
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
		min: [0,'invalid status'],
    	max: [12,'invalid status'],
		trim: true,
		default: 0,
	},
	date: {
		type: Number,
		min: [0,'invalid status'],
    	max: [31,'invalid status'],
		trim: true,
		default: 0,
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
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false},
},{
	timestamps: true,
	versionKey: false
});

const PpmEquipmentAssetAssign = new mongoose.model("Ppm_Equipment_Asset_Assign", PpmEquipmentAssetAssignSchema);
module.exports = PpmEquipmentAssetAssign;