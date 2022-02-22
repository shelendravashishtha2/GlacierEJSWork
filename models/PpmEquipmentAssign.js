const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const PpmEquipmentAssignSchema = new mongoose.Schema({
	propertyId: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Property',
		required:true
	},
	// ppmEquipmentId: {
	// 	type: mongoose.Schema.Types.ObjectId, ref: 'Ppm_Equipment_Master',
	// 	required:true,
	// },
	ppmEquipmentName: {
		type: String,
		required:true,
		trim: true,
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

const PpmEquipmentAssign = new mongoose.model("Ppm_Equipment_Assign", PpmEquipmentAssignSchema);
module.exports = PpmEquipmentAssign;