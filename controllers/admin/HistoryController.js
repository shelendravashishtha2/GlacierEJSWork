const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require("joi");
const response = require("../../helper/response");
const Property = require("../../models/Property");

// index
exports.index = async (req, res) => {
	try {
		res.locals = { title: 'History', session: req.session };
		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		let PropertyList = await Property.find({status: 1}).sort({createdAt: 'desc'});

		return res.render('Admin/History/index', {
            PropertyList: PropertyList,
            message: req.flash('message'),
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
		res.locals = { title: 'History', session: req.session };
		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		let schema = Joi.object({
			historyType: Joi.required(),
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		if (req.body.historyType == 1) {
			return res.redirect('/ppm-history?propertyId='+req.body.propertyId+'&&startDate='+req.body.startDate+'&&endDate='+req.body.endDate);
		} else if (req.body.historyType == 2) {
			return res.redirect('/frc-history?propertyId='+req.body.propertyId+'&&startDate='+req.body.startDate+'&&endDate='+req.body.endDate);
		} else {
			return res.redirect('/history');
		}
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}