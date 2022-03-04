const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const Property = require("./Property");
const MngRatingGroupMaster = require("./MngRatingGroupMaster");
const MngRatingTopicMaster = require("./MngRatingTopicMaster");
const MngRatingChecklistMaster = require("./MngRatingChecklistMaster");

const MngRatingChecklistAssignSchema = new mongoose.Schema({
    propertyId: {
		type:  mongoose.Schema.Types.ObjectId, ref: Property,
		required: true
    },
	ratingGroupId: {
		type:  mongoose.Schema.Types.ObjectId, ref: MngRatingGroupMaster,
		required: true
	},
	ratingTopicId: {
		type:  mongoose.Schema.Types.ObjectId, ref: MngRatingTopicMaster,
		required: true
	},
	checklistIds: {
		type:  [mongoose.Schema.Types.ObjectId], ref: MngRatingChecklistMaster,
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

MngRatingChecklistAssignSchema.plugin(mongoosePaginate);

const MngRatingChecklistAssign = new mongoose.model("Mng_Rating_Checklist_Assign", MngRatingChecklistAssignSchema);
module.exports = MngRatingChecklistAssign;