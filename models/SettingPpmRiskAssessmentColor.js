const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const SettingPpmRiskAssessmentColorSchema = new mongoose.Schema({
	color_name: {
		type: String,
		required:true,
		trim: true,
	},
},{
	timestamps: true,
	versionKey: false
});

const SettingPpmRiskAssessmentColor = new mongoose.model("Setting_Ppm_Risk_Assessment_Color", SettingPpmRiskAssessmentColorSchema);
module.exports = SettingPpmRiskAssessmentColor;