const mongoose = require("mongoose");
const MngRatingGroupMasterSchema = new mongoose.Schema({
	groupName: {
		type: String,
		trim: true,
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


const MngRatingGroupMaster = new mongoose.model("Mng_Rating_Group_Master", MngRatingGroupMasterSchema);
module.exports = MngRatingGroupMaster;