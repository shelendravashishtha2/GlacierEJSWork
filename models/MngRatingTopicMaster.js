const mongoose = require("mongoose");
const MngRatingTopicMasterSchema = new mongoose.Schema({
	ratingGroupId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'Mng_Rating_Group_Master',
		required: true
	},
	topicName: {
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


const MngRatingTopicMaster = new mongoose.model("Mng_Rating_Topic_Master", MngRatingTopicMasterSchema);
module.exports = MngRatingTopicMaster;