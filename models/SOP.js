const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const User = require("./User");

const SubCategorySchema = new mongoose.Schema({ 
	sub_category_name: {
		type: String,
		trim: true
	},
	sub_category_files: {
		type: [String],
		trim: true
	}, 
});

const SOPSchema = new mongoose.Schema({
	category_name: {
		type: String,
		required:true,
		trim: true,
		required: true
	},
	level: {
		type: Number,
		trim: true,
		required: true
	},
	single_category_files: {
		type: [String],
		trim: true
	},
	sub_category: [SubCategorySchema],

	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1
	},
	createdBy: {type: mongoose.Schema.Types.ObjectId, ref: User, select: false},
	updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: User, select: false},
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	timestamps: true,
	versionKey: false
});

SOPSchema.plugin(mongoosePaginate);

const SOP = new mongoose.model("sop", SOPSchema);
module.exports = SOP;