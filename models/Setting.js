const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const settingSchema = new mongoose.Schema({
	uniqueId: {
		type: Number
	}
},{
	timestamps: true,
	versionKey: false
});

settingSchema.plugin(mongoosePaginate);

const setting = new mongoose.model("setting", settingSchema);
module.exports = setting;