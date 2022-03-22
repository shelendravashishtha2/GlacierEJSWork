const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const SettingSchema = new mongoose.Schema({
	uniqueId: {
		type: Number
	}
},{
	timestamps: true,
	versionKey: false
});

SettingSchema.plugin(mongoosePaginate);

const Setting = new mongoose.model("Setting", SettingSchema);
module.exports = Setting;