const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({ 
	taskName: {
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
	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 1,
	},
	day: {
		type: String,
		enum: ['','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
		trim: true,
		default: '',
	},
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false },
	createdAt: {type: Date, default: Date.now, select: false},
	updatedAt: {type: Date, default: Date.now, select: false}
});

const ppmEquipmentSchema = new mongoose.Schema({
	ppmEquipmentName: {
		type: String,
		required:true,
		trim: true,
		unique: true
	},
	tasks: [taskSchema],

	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1,
	},
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', select: false },
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	timestamps: true,
	versionKey: false
});

const ppmEquipment = new mongoose.model("ppm_Equipment", ppmEquipmentSchema);
module.exports = ppmEquipment;