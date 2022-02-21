const mongoose = require("mongoose");

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
		enum:['Thrice-a-day','Twice-a-day','Daily','Weekly','Biweekly','Fortnightly','Monthly','Quarterly','Annually','Bi-Annually'],
		required:true,
		trim: true,
	},
	month: {
		type: Number,
		min: [1,'invalid status'],
    	max: [12,'invalid status'],
		trim: true,
		default: 0,
	},
	date: {
		type: Number,
		min: [1,'invalid status'],
    	max: [31,'invalid status'],
		trim: true,
		default: 0,
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
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false},
},{
	timestamps: true,
	versionKey: false
});

const PpmEquipmentAssetAssign = new mongoose.model("Ppm_Equipment_Asset_Assign", PpmEquipmentAssetAssignSchema);
module.exports = PpmEquipmentAssetAssign;