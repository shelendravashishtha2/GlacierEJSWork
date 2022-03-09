const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const CategoryAssign = require("./CategoryAssign");
const CategoryFrcAssign = require("./CategoryFrcAssign");
const Property = require("./Property");
const User = require("./User");

const CategoryFrcAssignTaskSchema = new mongoose.Schema({
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId, ref: Property,
		required: true
	},
	assignCategoryId: {
		type:  mongoose.Schema.Types.ObjectId, ref: CategoryAssign,
		required: true,
	},
	assignCategoryFrcId: {
		type:  mongoose.Schema.Types.ObjectId, ref: CategoryFrcAssign,
		required: true,
	},

	form: {
		type: Array,
		default: [],
	},
	dueDate: { //task created Date
		type: Date,
		// default: '',
		required: true,
	},
	completionBy: {
		type:  mongoose.Schema.Types.ObjectId, ref: User,
		default: null,
	},
	completionDate: {
		type: Date,
		default: '',
	},
	percentage:{
		type: Number,
		default: 0
	},
	completionStatus: {
		type: Number, //1=pending, 2=incomplete, 3=completed
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1
	},

	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1, select: false
	},
	isDeleted: {
		type: Number, //0=not-Deleted, 1=Deleted
		min: [0,'invalid status'], max: [1,'invalid status'], default: 0, select: false
	},
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	timestamps: true,
	versionKey: false
});

CategoryFrcAssignTaskSchema.plugin(mongoosePaginate);

const CategoryFrcAssignTask = new mongoose.model("Category_Frc_Assign_Task", CategoryFrcAssignTaskSchema);
module.exports = CategoryFrcAssignTask;