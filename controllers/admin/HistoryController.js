const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require("joi");
const response = require("../../helper/response");
const Property = require("../../models/Property");
const PpmTaskAssign = require("../../models/PpmTaskAssign");

// index
exports.index = async (req, res) => {
	try {
		res.locals.title = 'History';
		res.locals.session = req.session;

		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		let PropertyList = await Property.find({status: 1}).sort({property_name: 'asc'});

		return res.render('Admin/History/index', {
            PropertyList: PropertyList,
            success: req.flash('success'),
            error: req.flash('error'),
        })
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

// index filter
exports.indexFilter = async (req, res) => {
	try {
		res.locals.title = 'History Filter';
		res.locals.session = req.session;

		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		let schema = Joi.object({
			historyType: Joi.required(),
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			status: Joi.optional()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		if (req.body.historyType == 1) {
			return res.redirect('/ppm-history?propertyId='+req.body.propertyId+'&&startDate='+req.body.startDate+'&&endDate='+req.body.endDate+'&&status='+req.body.status);
		} else if (req.body.historyType == 2) {
			return res.redirect('/frc-history?propertyId='+req.body.propertyId+'&&startDate='+req.body.startDate+'&&endDate='+req.body.endDate+'&&status='+req.body.status);
		} else if (req.body.historyType == 3) {
			return res.redirect('/rating-history?propertyId='+req.body.propertyId+'&&startDate='+req.body.startDate+'&&endDate='+req.body.endDate+'&&status='+req.body.status);
		} else {
			return res.redirect('/history');
		}
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmHistory = async (req, res) => {
	try {
		res.locals.title = 'PPM History';
		res.locals.session = req.session;

		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		if (req.query.historyType == 1) {
			return res.redirect('/ppm-history?propertyId='+req.query.propertyId+'&&startDate='+req.query.startDate+'&&endDate='+req.query.endDate+'&&status='+req.query.status);
		} else if (req.query.historyType == 2) {
			return res.redirect('/frc-history?propertyId='+req.query.propertyId+'&&startDate='+req.query.startDate+'&&endDate='+req.query.endDate+'&&status='+req.query.status);
		} else if (req.query.historyType == 3) {
			return res.redirect('/rating-history?propertyId='+req.query.propertyId+'&&startDate='+req.query.startDate+'&&endDate='+req.query.endDate+'&&status='+req.query.status);
		}

		let schema = Joi.object({
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			status: Joi.optional()
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		const PropertyList = await Property.find({status: 1}).sort({property_name: 'asc'});

		const startDate = moment(req.query.startDate, 'DD-MM-YYYY');
		const endDate   = moment(req.query.endDate, 'DD-MM-YYYY');

		let findQuery = { 
			propertyId: req.query.propertyId, 
			status: 1,
		}
		let PpmTaskAssignData = await PpmTaskAssign.find(findQuery).populate({path: 'assignPpmEquipmentId'}).populate({path: 'assignPpmEquipmentAssetId'});

		// console.log(PpmTaskAssignData);

		return res.render('Admin/History/ppm-history', {
			data: req.query,
			PropertyList: PropertyList,
            PpmTaskAssignData: PpmTaskAssignData,
            success: req.flash('success'),
            error: req.flash('error'),
        })
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.frcHistory = async (req, res) => {
	try {
		res.locals.title = 'FRC History';
		res.locals.session = req.session;

		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		if (req.query.historyType == 1) {
			return res.redirect('/ppm-history?propertyId='+req.query.propertyId+'&&startDate='+req.query.startDate+'&&endDate='+req.query.endDate+'&&status='+req.query.status);
		} else if (req.query.historyType == 2) {
			return res.redirect('/frc-history?propertyId='+req.query.propertyId+'&&startDate='+req.query.startDate+'&&endDate='+req.query.endDate+'&&status='+req.query.status);
		} else if (req.query.historyType == 3) {
			return res.redirect('/rating-history?propertyId='+req.query.propertyId+'&&startDate='+req.query.startDate+'&&endDate='+req.query.endDate+'&&status='+req.query.status);
		}

		let schema = Joi.object({
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
			status: Joi.optional()
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		const PropertyList = await Property.find({status: 1}).sort({property_name: 'asc'});

		const startDate = moment(req.query.startDate, 'DD-MM-YYYY');
		const endDate   = moment(req.query.endDate, 'DD-MM-YYYY');

		let findQuery = { 
			propertyId: req.query.propertyId, 
			status: 1,
		}
		let PpmTaskAssignData = await PpmTaskAssign.find(findQuery).populate({path: 'assignPpmEquipmentId'}).populate({path: 'assignPpmEquipmentAssetId'});

		// console.log(PpmTaskAssignData);
		return res.send(response.error(500, 'data', [PpmTaskAssignData]));

		return res.render('Admin/History/frc-history', {
			data: req.query,
			PropertyList: PropertyList,
            PpmTaskAssignData: PpmTaskAssignData,
            success: req.flash('success'),
            error: req.flash('error'),
        })
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}