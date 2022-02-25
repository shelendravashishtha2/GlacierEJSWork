const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const wingsSchema = new mongoose.Schema({ 
	wings_name: {
		type: String,
		trim: true,
	},
	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 1,
	},
});

const propertySchema = new mongoose.Schema({
	property_name: {
		type: String,
		required:true,
		trim: true,
		unique: true
	},
	address: {
		type: String,
		required:true,
		trim: true,
	},
	propertyLatLong: {
        type: [Number],
        required:true,
        index: '2d'
    },
	property_images: {
		type: [String],
		trim: true,
	},
	name_of_owner: {
		type: String,
		trim: true,
	},
	area_name: {
		type: String,
		trim: true,
	},
	square_feet: {
		type: String,
		trim: true,
	},
	rating: {
		type: Number,
		default:0
	},
	rate_count: {
		type: Number,
		default:0
	},
	wings:[wingsSchema],

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

propertySchema.plugin(mongoosePaginate);

const Property = new mongoose.model("Property", propertySchema);
module.exports = Property;