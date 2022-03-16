const Category = require("../../../models/CategoryMaster");
const CategoryChecklist = require("../../../models/CategoryFrcMaster");
const CategoryFrcAssignTask = require("../../../models/CategoryFrcAssignTask");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const response = require("../../../helper/response");
const Joi = require('joi');
const PpmTaskAssign = require("../../../models/PpmTaskAssign");
Joi.objectId = require('joi-objectid')(Joi);

exports.frcHistory = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			// status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, startDate, endDate } = req.body;

		let findQuery = {
			propertyId: propertyId,
			status: 1,
			completionStatus: 2, //1=pending, 2=completed, 3=incomplete
			dueDate: {
				$gte: moment(startDate, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(endDate, 'DD-MM-YYYY').endOf('day')
			}
		}
		let FrcTaskHistoryData = await CategoryFrcAssignTask.find(findQuery);
		
		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "FRC History",
		    data: FrcTaskHistoryData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmHistory = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			// status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		let { propertyId, startDate, endDate } = req.body;

		let findQuery = { 
			propertyId: propertyId, 
			status: 1,
			completionStatus: 2, //1=pending, 2=completed, 3=incomplete
			dueDate: {
				$gte: moment(startDate, 'DD-MM-YYYY').startOf('day'),
				$lte: moment(endDate, 'DD-MM-YYYY').endOf('day')
			}
		}
		let PpmTaskAssignData = await PpmTaskAssign.find(findQuery).populate({path: 'assignPpmEquipmentId'})//.populate({path: 'assignPpmEquipmentAssetId'});
		
		return res.status(200).send({
		    status: true,
            status_code: "200",
            message: "PPM History",
		    data: PpmTaskAssignData
		});
	} catch (error) {
		errorLog(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}