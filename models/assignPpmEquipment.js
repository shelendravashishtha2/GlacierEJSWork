const mongoose = require("mongoose");

const assignPpmEquipmentSchema = new mongoose.Schema({
	propertyId: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Property',
		required:true
	},
	ppmEquipmentId: {
		type: mongoose.Schema.Types.ObjectId, ref: 'ppm_Equipment',
		required:true,
	},

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

const assignPpmEquipment = new mongoose.model("assign_Ppm_Equipment", assignPpmEquipmentSchema);
module.exports = assignPpmEquipment;