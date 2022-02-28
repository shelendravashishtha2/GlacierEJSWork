const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const Property = require("./Property");
const PpmEquipmentAssign = require("./PpmEquipmentAssign");
const PpmEquipmentAssetAssign = require("./PpmEquipmentAssetAssign");

const PpmTaskAssignSchema = new mongoose.Schema({
	propertyId: {
		type: mongoose.Schema.Types.ObjectId, ref: Property,
		required:true
	},
	assignPpmEquipmentId: {
		type: mongoose.Schema.Types.ObjectId, ref: PpmEquipmentAssign,
		required:true,
	},
	assignPpmEquipmentAssetId: {
		type: mongoose.Schema.Types.ObjectId, ref: PpmEquipmentAssetAssign,
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
		default: ''
	},
	vendorName: {
		type: String,
		trim: true,
		default: ''
	},
	frequency: {
		type: String,
		trim: true,
		default: ''
	},
	dueDate: {
		type: Date,
		default: ''
	},
	completionDate: {
		type: Date,
		default: ''
	},
	completionBy: {
		type: String,
		trim: true,
		default: ''
	},
	completionStatus: {
		type: Number, //1=pending, 2=In-progress 3=completed 4=incomplete
		min: [1,'invalid status'], max: [4,'invalid status'], default: 1,
	},
	remark: {
		type: String,
		default: ''
	},
	attachPhotos: {
		type: [String]
	},
	serviceReports: {
		type: [String]
	},
	riskAssessmentStatus: {
		type: Number, //1=No Risk, 2=Asset itself 3=environment
		min: [1,'invalid status'], 
		max: [3,'invalid status'], 
		default: 1,
	},
	riskAssessmentAssetStatusColor: {
		type: String,
		default: 'Green'
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

const PpmTaskAssign = new mongoose.model("Ppm_Task_Assign", PpmTaskAssignSchema);
module.exports = PpmTaskAssign;