const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const User = require('./User');
const Property = require('./Property');

const UserPropertySchema = new mongoose.Schema({
	userId: {
		type:  mongoose.Schema.Types.ObjectId, ref: User,
		required: true,
		trim: true
	},
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId, ref: Property,
		required: true,
		trim: true
	},

	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1
	},
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	timestamps: true,
	versionKey: false
});

UserPropertySchema.plugin(mongoosePaginate);

const UserProperty = new mongoose.model("User_Property", UserPropertySchema);
module.exports = UserProperty;