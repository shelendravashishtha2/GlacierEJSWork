const mongoose = require("mongoose");

const SettingRatingSchema = new mongoose.Schema({
	rating_name: {
		type: String,
		required:true,
		trim: true,
	},
	min_rating: {
		type: Number,
		required: true,
		min: [0,'invalid number'],
    	max: [100,'invalid number'],
	},
	max_rating: {
		type: Number,
		required: true,
		min: [0, 'invalid number'],
    	max: [100, 'invalid number'],
	},
	
	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1, select: false
	},
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	timestamps: true,
	versionKey: false
});

const SettingRating = new mongoose.model("Setting_Rating", SettingRatingSchema);
module.exports = SettingRating;