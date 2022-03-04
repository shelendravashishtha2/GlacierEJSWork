const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const MngRatingChecklistMaster = require("./MngRatingChecklistMaster");
const MngRatingGroupMaster = require("./MngRatingGroupMaster");
const MngRatingTopicMaster = require("./MngRatingTopicMaster");
const Property = require("./Property");
const User = require("./User");

const checklistSchema = new mongoose.Schema({ 
	checklistId: {
		type:  mongoose.Schema.Types.ObjectId, ref: MngRatingChecklistMaster,
		required: true
	},
	weightage: {
		type: Number,
		min: [0,'invalid weightage'],
		max: [1,'invalid weightage']
	},
	point: {
		type: Number,
		min: [0,'invalid point'],
		max: [1,'invalid point']
	},
	remark: {
		type: String,
	},
	attachPhotos: {
		type: [String]
	},
});

const topicSchema = new mongoose.Schema({ 
	topicId: {
		type:  mongoose.Schema.Types.ObjectId, ref: MngRatingTopicMaster,
		required: true
	},
	assignChecklists: [checklistSchema],
});

const groupSchema = new mongoose.Schema({ 
	groupId: {
		type:  mongoose.Schema.Types.ObjectId, ref: MngRatingGroupMaster,
		required: true
	},
	assignTopics: [topicSchema],
});


const MngRatingTaskAssignSchema = new mongoose.Schema({
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId, ref: Property,
		required: true
    },
	auditorId: {
		type:  mongoose.Schema.Types.ObjectId, ref: User,
		required: true
	},

	assignGroups: [groupSchema],

	totalWeightage: {
		type: Number,
		// default: 0
	},
	totalPoint: {
		type: Number,
		// default: 0
	},
	totalPercentage: {
		type: Number,
		min: [0,'invalid percentage'],
		max: [100,'invalid percentage'],
		// default: 0
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

MngRatingTaskAssignSchema.plugin(mongoosePaginate);

const MngRatingTaskAssign = new mongoose.model("Mng_Rating_Task_Assign", MngRatingTaskAssignSchema);
module.exports = MngRatingTaskAssign;