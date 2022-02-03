const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({ 
	topicIds: {
		type:  mongoose.Schema.Types.ObjectId, ref: 'Mng_Rating_Group_Master',
		required: true
	},
	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'],
		default: 1,
	},
});

const groupSchema = new mongoose.Schema({ 
	groupIds: {
		type:  mongoose.Schema.Types.ObjectId, ref: 'Mng_Rating_Group_Master',
		required: true
	},
	assignTopic: [topicSchema],
	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'],
		default: 1,
	},
});

const MngRatingAssignSchema = new mongoose.Schema({
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'Property',
		required: true
    },
	assignGroup: [groupSchema],
    // assignGroup: [
	// 	groupIds: [{
	// 		type:  mongoose.Schema.Types.ObjectId,
	// 		ref: 'Mng_Rating_Group_Master',
	// 		required: true
	// 	},
	// 	status: {
	// 		type: Number, //0=Inactive, 1=Active
	// 		min: [0,'invalid status'], max: [1,'invalid status'], default: 1
	// 	},
	// 	topicList: [

	// 	]]
	// ],
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

const MngRatingAssign = new mongoose.model("Mng_Rating_Group_Assign", MngRatingAssignSchema);
module.exports = MngRatingAssign;