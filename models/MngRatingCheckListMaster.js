const mongoose = require("mongoose");
const MngRatingCheckListMasterSchema = new mongoose.Schema({
	ratingGroupId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'Mng_Rating_Group_Master',
		required: true
	},
	ratingTopicId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'Mng_Rating_Topic_Master',
		required: true
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


const MngRatingCheckListMaster = new mongoose.model("Mng_Rating_CheckList_Master", MngRatingCheckListMasterSchema);
module.exports = MngRatingCheckListMaster;