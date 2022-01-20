const mongoose = require("mongoose");
const mngRatingCheckListSchema = new mongoose.Schema({
	ratingGroupId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'mng_Rating_Group',
		required: true
	},
	ratingTopicId: {
		// type: String,
		// trim: true,
		// required: true
	},
	checkListTitle: {
		type: String,
		trim: true,
		required: true
	},
	cueForAuditor: {
		type: String,
		trim: true,
		required: true
	},
	weightage: {
		type: Number,
		min: [0,'invalid weightage'], 
		max: [1,'invalid weightage']
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


const mngRatingCheckList = new mongoose.model("mng_Rating_Check_List", mngRatingCheckListSchema);
module.exports = mngRatingCheckList;