const mongoose = require("mongoose");

const assignPpmTaskSchema = new mongoose.Schema({
	propertyId: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Property',
		required:true
	},
	assignPpmEquipmentId: {
		type: mongoose.Schema.Types.ObjectId, ref: 'assign_Ppm_Equipment',
		required:true,
	},
	assignPpmEquipmentAssetId: {
		type: mongoose.Schema.Types.ObjectId, ref: 'assign_Ppm_Equipment_Asset',
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
		trim: true,
	},
	frequency: {
		type: String,
		trim: true,
	},
	dueDate: {
		type: Date,
	},
	completionDate: {
		type: Date,
	},
	completionBy: {
		type: String,
		trim: true,
	},
	completionStatus: {
		type: Number, //1=pending, 2=In-progress 3=completed 4=incomplete
		min: [1,'invalid status'], max: [4,'invalid status'], default: 1,
	},
	remark: {
		type: String
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
		type: String
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

const assignPpmTask = new mongoose.model("assign_Ppm_Task", assignPpmTaskSchema);
module.exports = assignPpmTask;