const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const daysEnum = require("../enum/daysEnum");
const frequencyEnum = require("../enum/frequencyEnum");
const { prependToArray } = require("../helper/commonHelpers");

let daysArr = Object.keys(daysEnum);
let days = prependToArray('',daysArr);
let frequencyArr = Object.keys(frequencyEnum);
frequencyArr = prependToArray('none', frequencyArr);

const CategoryFrcAssignSchema = new mongoose.Schema({
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId, 
		ref: 'Property',
		required: true
	},
	assignCategoryId: {
		type:  mongoose.Schema.Types.ObjectId, 
		ref: 'Category_Assign',
		required: true
	},
	supervisorId: {
		type:  [mongoose.Schema.Types.ObjectId], 
		ref: 'User',
		default: []
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

const CategoryFrcAssign = new mongoose.model("Category_Frc_Assign", CategoryFrcAssignSchema);
module.exports = CategoryFrcAssign;