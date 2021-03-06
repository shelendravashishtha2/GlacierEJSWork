const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const MngRatingGroupMaster = require("./MngRatingGroupMaster");
const MngRatingTopicMaster = require("./MngRatingTopicMaster");
const Property = require("./Property");

const MngRatingTopicAssignSchema = new mongoose.Schema({
    propertyId: {
		type:  mongoose.Schema.Types.ObjectId, ref: Property,
		required: true
    },
    groupId: {
		type:  mongoose.Schema.Types.ObjectId, ref: MngRatingGroupMaster,
		required: true
	},
	topicIds: {
		type:  [mongoose.Schema.Types.ObjectId], ref: MngRatingTopicMaster,
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

MngRatingTopicAssignSchema.plugin(mongoosePaginate);

const MngRatingTopicAssign = new mongoose.model("Mng_Rating_Topic_Assign", MngRatingTopicAssignSchema);
module.exports = MngRatingTopicAssign;