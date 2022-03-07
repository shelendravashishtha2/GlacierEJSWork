const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
// const soft_delete = require('mongoose-softdelete');
const soft_delete = require('./softDelete');

const CategoryMasterSchema = new mongoose.Schema({
	category_name: {
		type: String,
		required:true,
		trim: true,
		unique: true
	},

	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1
	},
	isDeleted: {
		type: Number, //0=not-Deleted, 1=Deleted
		min: [0,'invalid status'], max: [1,'invalid status'], default: 0
	},
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	timestamps: true,
	versionKey: false
});

CategoryMasterSchema.plugin(soft_delete);
CategoryMasterSchema.plugin(mongoosePaginate);

const CategoryMaster = new mongoose.model("Category_Master", CategoryMasterSchema);
module.exports = CategoryMaster;