const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const SettingPpmRiskAssessmentColorSchema = new mongoose.Schema({
	color_name: {
		type: String,
		required:true,
		trim: true,
	},

	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1, select: false
	},
	createdAt: {type: Date, select: false},
	updatedAt: {type: Date, select: false}
},{
	timestamps: true,
	versionKey: false
});

const SettingPpmRiskAssessmentColor = new mongoose.model("Setting_Ppm_Risk_Assessment_Color", SettingPpmRiskAssessmentColorSchema);
module.exports = SettingPpmRiskAssessmentColor;