const mongoose = require("mongoose");

const categoryCheckListSchema = new mongoose.Schema({
	category_id: {
		type: String,
		trim: true,
	},
    checklist_id: {
		type: String,
		trim: true,
	},
    checklist_name: {
		type: String,
		trim: true,
	},
    type: { //1=Form, 2=Register, 3=Checklist
		type: String,
		trim: true,
	},
	frequency: { //1=Weekly, 2=Weekly, 3=Quarterly, 3=Annually, 3=Bi-Annually
		type: String,
		trim: true,
	},
	month: {
		type: String,
		trim: true,
	},
	date: {
		type: String,
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