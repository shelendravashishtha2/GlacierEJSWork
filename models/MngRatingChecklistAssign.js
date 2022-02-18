const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const MngRatingChecklistAssignSchema = new mongoose.Schema({
    propertyId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'Property',
		required: true
    },
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
	checklistIds: {
		type:  [mongoose.Schema.Types.ObjectId],
		ref: 'Mng_Rating_Checklist_Master',
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