const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const MngRatingGroupMaster = require("./MngRatingGroupMaster");
const MngRatingTopicMaster = require("./MngRatingTopicMaster");

const MngRatingChecklistMasterSchema = new mongoose.Schema({
	ratingGroupId: {
		type:  mongoose.Schema.Types.ObjectId, ref: MngRatingGroupMaster,
		required: true
	},
	ratingTopicId: {
		type:  mongoose.Schema.Types.ObjectId, ref: MngRatingTopicMaster,
		required: true
	},
	checklistTitle: {
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

MngRatingChecklistMasterSchema.plugin(mongoosePaginate);

const MngRatingChecklistMaster = new mongoose.model("Mng_Rating_Checklist_Master", MngRatingChecklistMasterSchema);
module.exports = MngRatingChecklistMaster;