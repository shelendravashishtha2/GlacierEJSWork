const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const CategoryAssignSchema = new mongoose.Schema({
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId, 
		ref: 'Property',
		required: true
	},
	wingIds: {
		type:  [mongoose.Schema.Types.ObjectId],
		ref: 'Property',
		default: []
	},
	categoryId: {
		type:  mongoose.Schema.Types.ObjectId, 
		ref: 'Category_Master',
		required: true
	},
	operationTeamId: {
		type:  [mongoose.Schema.Types.ObjectId], 
		ref: 'User',
		default: []
	},
	managerId: {
		type:  [mongoose.Schema.Types.ObjectId], 
		ref: 'User',
		default: []
	},
	supervisorId: {
		type:  [mongoose.Schema.Types.ObjectId], 
		ref: 'User',
		default: []
	},
	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'],
		default: 1,
	},
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	timestamps: true,
	versionKey: false
});

const CategoryAssign = new mongoose.model("Category_Assign", CategoryAssignSchema);
module.exports = CategoryAssign;