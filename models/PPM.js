const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({ 
	taskName: {
		type: String,
		required:true,
		trim: true,
	},
	vendorName: {
		type: String,
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
	created_by: {
		// type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	},
	updated_by: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
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

const ppmSchema = new mongoose.Schema({
	ppmName: {
		type: String,
		required:true,
		trim: true,
		unique: true
	},
	status: {
		type: Number, // 1=active, 0=Inactive
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 1,
	},
	tasks: [taskSchema],
	
	created_by: {
		// type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	},
	updated_by: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
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

const PPM = new mongoose.model("ppm", ppmSchema);
module.exports = PPM;