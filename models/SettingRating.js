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
	}
},{
	timestamps: true,
	versionKey: false
});

const SettingRating = new mongoose.model("Setting_Rating", SettingRatingSchema);
module.exports = SettingRating;