const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
	category_name: {
		type: String,
		trim: true,
		unique: true
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

const Category = new mongoose.model("Category", categorySchema);
module.exports = Category;