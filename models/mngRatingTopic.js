const mongoose = require("mongoose");
const mngRatingTopicSchema = new mongoose.Schema({
	ratingGroupId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'mng_Rating_Group',
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


const mngRatingTopic = new mongoose.model("mng_Rating_Topic", mngRatingTopicSchema);
module.exports = mngRatingTopic;