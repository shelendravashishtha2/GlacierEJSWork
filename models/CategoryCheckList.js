const mongoose = require("mongoose");

const categoryCheckListSchema = new mongoose.Schema({
	category_id: {
		type:  mongoose.Schema.Types.ObjectId,
		required:true,
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
    type: { //1=Form, 2=Register, 3=Checklist
		type: String,
		enum:['form','register','check_list'],
		required:true,
		trim: true,
	},
	frequency: { //1=Weekly, 2=Weekly, 3=Quarterly, 3=Annually, 3=Bi-Annually
		type: String,
		enum:['monthly','quarterly','annually','bi-annually','weekly'],
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
	status: {
		type: Number, // 1=active, 0=Inactive
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 1,
	},
	created_at: {
		type: Date,
		default: Date.now,
		select: false
	},
	updated_at: {
		type: Date,
		default: Date.now,
		select: false
	}
});

const CategoryCheckList = new mongoose.model("category_check_list", categoryCheckListSchema);
module.exports = CategoryCheckList;