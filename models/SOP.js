const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema({ 
	sub_category_name: {
		type: String,
		trim: true,
		required: true
	},
	sub_category_files: {
		type: [String],
		trim: true,
		required: true
	}, 
});

const SOPSchema = new mongoose.Schema({
	category_name: {
		type: String,
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
		trim: true,
		required: true
	},
	sub_category: [SubCategorySchema],

	status: {
		type: Number, //0=Inactive, 1=Active
		default: 1,
	},
	created_by: {
		// type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	},
	updated_by: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	},
	created_at: { 
		type: Date
	},
	updated_at: {
		type: Date
	}
},{
	versionKey: false,
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

// const SOPData = new SOP({
// 	category_name: "asdfasdasd",
// 	level: "1",
// 	single_category_files: [
// 		"fun.png",
// 		"humore.png"
// 	],
// 	sub_category: [
// 		{
// 			sub_category_name: "test",
// 			sub_category_files: [
// 				"fun.png",
// 				"humore.png"
// 			],
// 		},
// 		{
// 			sub_category_name: "test2",
// 			sub_category_files: [
// 				"fun.png",
// 				"humore.png"
// 			],
// 		}
// 	],
// 	// created_by: req.user._id
// });
// await SOPData.save();

const SOP = new mongoose.model("sop", SOPSchema);
module.exports = SOP;