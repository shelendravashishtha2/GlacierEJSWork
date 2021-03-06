const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const Property = require("./Property");
const User = require("./User");
const MngRatingChecklistMaster = require("./MngRatingChecklistMaster");

const MngRatingAssignChecklistPointSchema = new mongoose.Schema({
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId, ref: Property,
		required: true
    },
	auditorId: {
		type:  mongoose.Schema.Types.ObjectId, ref: User,
		required: true
	},
	checklistId: {
		type:  mongoose.Schema.Types.ObjectId, ref: MngRatingChecklistMaster,
		required: true
	},
	weightage: {
		type: Number,
		min: [0,'invalid weightage'],
		max: [1,'invalid weightage'],
		required: true
	},
	point: {
		type: Number,
		min: [0,'invalid point'],
		max: [1,'invalid point'],
		// default: 0,
		required: true
	},
	percentage: {
		type: Number,
		min: [0,'invalid percentage'],
		max: [100,'invalid percentage'],
		default: 0
	},
	remark: {
		type: String,
	},
	attachPhotos: {
		type: [String]
	},
	
	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1,
	},
	createdAt: {type: Date},
	updatedAt: {type: Date, select: false}
},{
	versionKey: false,
	timestamps: true
});

MngRatingAssignChecklistPointSchema.plugin(mongoosePaginate);

const MngRatingAssignChecklistPoint = new mongoose.model("Mng_Rating_Assign_Checklist_Point", MngRatingAssignChecklistPointSchema);
module.exports = MngRatingAssignChecklistPoint;