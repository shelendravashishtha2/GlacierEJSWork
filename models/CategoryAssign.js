const mongoose = require("mongoose");

const CategoryAssignSchema = new mongoose.Schema({
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId, 
		ref: 'Property',
		required: true
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
	// supervisorId: {
	// 	type:  [mongoose.Schema.Types.ObjectId], 
	// 	ref: 'User',
	// 	default: []
	// }
},{
	timestamps: true,
	versionKey: false
});

const CategoryAssign = new mongoose.model("Category_Assign", CategoryAssignSchema);
module.exports = CategoryAssign;