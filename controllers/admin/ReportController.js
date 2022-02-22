const response = require("../../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { errorLog } = require("../../helper/consoleLog");
const Joi = require("joi");
const PropertyResource = require('../resources/PropertyResource');
const PpmEquipment = require("../../models/PpmEquipmentMaster");
const PpmEquipmentAssign = require("../../models/PpmEquipmentAssign");
const PpmEquipmentAssetAssign = require("../../models/PpmEquipmentAssetAssign");
const Property = require("../../models/Property");
const PpmTaskAssign = require("../../models/PpmTaskAssign");
const daysEnum = require("../../enum/daysEnum");
// console.log(daysEnum.Monday);

// index
exports.index = async (req, res) => {
	try {
		res.locals = { title: 'Report', session: req.session };
		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		// let schema = Joi.object({
		// 	ppmId: Joi.required()
		// });
		// let validation = schema.validate(req.body, __joiOptions);
		// if (validation.error) {
		// 	return res.send(response.error(400, validation.error.details[0].message, []));
		// }

		// let paramsCategoryId = req.query.search;
		// let allCategoryData = await CategoryMaster.find({status: 1});
		// let findQuery = { status: 1 }
		// if (req.query.search) {
		// 	findQuery.category_id = req.query.search
		// }
		// let CategoryChecklistData = await CategoryFrcMaster.find(findQuery).populate({path: 'category_id'}).sort({createdAt: 'desc'});

		let PropertyList = await Property.find({status: 1}).sort({createdAt: 'desc'});

		return res.render('Admin/Reports/index', {
            PropertyList: PropertyList,
            message: req.flash('message'),
            error: req.flash('error'),
        })
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// index
exports.indexFilter = async (req, res) => {
	try {
		res.locals = { title: 'Report', session: req.session };
		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		console.log(req.body);

		return res.send(response.success(200, 'data', [req.body]));

		// let schema = Joi.object({
		// 	ppmId: Joi.required()
		// });
		// let validation = schema.validate(req.body, __joiOptions);
		// if (validation.error) {
		// 	return res.send(response.error(400, validation.error.details[0].message, []));
		// }

		// let paramsCategoryId = req.query.search;
		// let allCategoryData = await CategoryMaster.find({status: 1});
		// let findQuery = { status: 1 }
		// if (req.query.search) {
		// 	findQuery.category_id = req.query.search
		// }
		// let CategoryChecklistData = await CategoryFrcMaster.find(findQuery).populate({path: 'category_id'}).sort({createdAt: 'desc'});

		let PropertyList = await Property.find({status: 1}).sort({createdAt: 'desc'});

		return res.render('Admin/Reports/index', {
            PropertyList: PropertyList,
            message: req.flash('message'),
            error: req.flash('error'),
        })
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}