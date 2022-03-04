const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const daysEnum = require("../enum/daysEnum");
const frequencyEnum = require("../enum/frequencyEnum");
const { prependToArray } = require("../helper/commonHelpers");
const CategoryMaster = require("./CategoryMaster");

let daysArr = Object.keys(daysEnum);
let days = prependToArray('',daysArr);
let frequencyArr = Object.keys(frequencyEnum);
frequencyArr = prependToArray('none', frequencyArr);

const CategoryFrcMasterSchema = new mongoose.Schema({
	category_id: {
		type:  mongoose.Schema.Types.ObjectId, ref: CategoryMaster,
		required: true,
		trim: true,
	},
    checklist_id: {
		type: String,
		required:true,
		trim: true,
	},
    checklist_name: {
		type: String,
		required:true,
		trim: true,
	},
    type: {
		type: String,
		enum: ['form','register','check_list'],
		required:true,
		trim: true,
	},
	form: {
		type: Array,
		default: [],
	},
	frequency: {
		type: String,
		enum: frequencyArr,
		required:true,
		trim: true,
	},
	month: {
		type: Number,
		min: [1,'invalid status'],
    	max: [12,'invalid status'],
		trim: true,
	},
	date: {
		type: Number,
		min: [1,'invalid status'],
    	max: [31,'invalid status'],
		trim: true,
	},
	day: {
		type: String,
		enum: days,
		trim: true,
	},

	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1,
	},
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	timestamps: true,
	versionKey: false
});

CategoryFrcMasterSchema.plugin(mongoosePaginate);

const CategoryFrcMaster = new mongoose.model("Category_Frc_Master", CategoryFrcMasterSchema);
module.exports = CategoryFrcMaster;