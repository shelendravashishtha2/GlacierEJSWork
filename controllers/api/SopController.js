const SOP = require("../../models/SOP");
const response = require("../../helper/response");
const mongoose = require("mongoose");
const {errorLog} = require("../../helper/consoleLog");
const console = require("../../helper/console");
const Joi = require("joi");

exports.sopCategoryList = async (req,res) => {
	try {
		let SOPData = await SOP.find();

		const responseData = [];
		for (let i = 0; i < SOPData.length; i++) {
			const elementData = SOPData[i];
			
			responseData.push({
				_id: elementData._id,
				category_name: elementData.category_name,
				level: elementData.level.toString(),
				single_category_files: elementData.single_category_files,
				sub_category: elementData.sub_category
			});
		}

		return res.send(response.success(200, 'success', responseData));
	} catch (error) {
		console.error(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
