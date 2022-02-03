const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const MngRatingGroupAssignSchema = new mongoose.Schema({
	propertyId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'Property',
		required: true
    },
    groupIds: {
		type:  [mongoose.Schema.Types.ObjectId],
		ref: 'Mng_Rating_Group_Master',
		required: true
	},
	auditorId: {
		type:  mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	
	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1
	},
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	versionKey: false,
	timestamps: true
});

MngRatingGroupAssignSchema.plugin(mongoosePaginate);

const MngRatingGroupAssign = new mongoose.model("Mng_Rating_Group_Assign", MngRatingGroupAssignSchema);
module.exports = MngRatingGroupAssign;