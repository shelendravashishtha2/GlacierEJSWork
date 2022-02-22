const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const ratingSchema = new mongoose.Schema({
	userId: {
		type:  mongoose.Schema.Types.ObjectId,
		required:true,
		trim: true,
	},
  	property_id: {
		type:  mongoose.Schema.Types.ObjectId,
		required:true,
		trim: true,
	},
	user_type: {
		type: String,
		trim: true,
	},
	rating: {
		type: Number,
		default:0
	},
	comment: {
		type: String,
		trim: true,
	}
},{
	timestamps: true,
	versionKey: false
})

const Rating = new mongoose.model("rating", ratingSchema);
module.exports = Rating;