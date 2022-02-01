const mongoose = require("mongoose");

const propertyTaskSchema = new mongoose.Schema({
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId,
		required: true
	},
	categoryId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		required: true
	},
	operationTeamId: {
		type:  [mongoose.Schema.Types.ObjectId],
		default: []
	},
	managerId: {
		type:  [mongoose.Schema.Types.ObjectId],
		default: []
	},
	supervisorId: {
		type:  [mongoose.Schema.Types.ObjectId],
		default: []
	}
},{
	timestamps: true,
	versionKey: false
});

const propertyTask = new mongoose.model("property_Task", propertyTaskSchema);
module.exports = propertyTask;