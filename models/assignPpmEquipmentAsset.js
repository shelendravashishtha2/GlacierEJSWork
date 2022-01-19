const mongoose = require("mongoose");

const assignPpmEquipmentAssetSchema = new mongoose.Schema({
	propertyId: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Property',
		required:true
	},
	ppmEquipmentId: {
		type: mongoose.Schema.Types.ObjectId, ref: 'ppm_Equipment',
		required:true,
	},

	assetName: {
		type: String,
		required: true,
		trim: true,
	},
	vendorName: {
		type: String,
		required:true,
		trim: true,
	},
	frequency: {
		type: String,
		enum:['Weekly','Fortnightly','Monthly','Quarterly','Annually','Bi-Annually'],
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
		enum: ['','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
		trim: true,
		default: '',
	},

	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1,
	},
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false },
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false},
},{
	timestamps: true,
	versionKey: false
});

const assignPpmEquipmentAsset = new mongoose.model("assign_Ppm_Equipment_Asset", assignPpmEquipmentAssetSchema);
module.exports = assignPpmEquipmentAsset;