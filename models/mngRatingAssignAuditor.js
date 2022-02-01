const mongoose = require("mongoose");
const mngRatingAssignAuditorSchema = new mongoose.Schema({
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'Property',
		required: true
    },
    groupId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'mng_Rating_Group',
		required: true
	},
	auditorId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1
	},
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	versionKey: false,
	timestamps: true
});

const mngRatingAssignAuditor = new mongoose.model("mng_Rating_Assign_Auditor", mngRatingAssignAuditorSchema);
module.exports = mngRatingAssignAuditor;