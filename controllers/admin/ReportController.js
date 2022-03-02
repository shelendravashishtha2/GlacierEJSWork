const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require("joi");
const response = require("../../helper/response");
const { errorLog } = require("../../helper/consoleLog");
const MomentRange = require('moment-range');
const PropertyResource = require('../resources/PropertyResource');
const PpmEquipment = require("../../models/PpmEquipmentMaster");
const PpmEquipmentAssign = require("../../models/PpmEquipmentAssign");
const PpmEquipmentAssetAssign = require("../../models/PpmEquipmentAssetAssign");
const Property = require("../../models/Property");
const PpmTaskAssign = require("../../models/PpmTaskAssign");
const daysEnum = require("../../enum/daysEnum");
const frequencyEnum = require("../../enum/frequencyEnum");
const CategoryFrcAssign = require('../../models/CategoryFrcAssign');

// index
exports.index = async (req, res) => {
	try {
		res.locals = { title: 'Report', session: req.session };
		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		let PropertyList = await Property.find({status: 1}).sort({property_name: 'asc'});

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

// index filter
exports.indexFilter = async (req, res) => {
	try {
		res.locals = { title: 'Report', session: req.session };
		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		let schema = Joi.object({
			reportType: Joi.required(),
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		if (req.body.reportType == 1) {
			return res.redirect('/ppm-report?propertyId='+req.body.propertyId+'&&startDate='+req.body.startDate+'&&endDate='+req.body.endDate);
		} else if (req.body.reportType == 2) {
			return res.redirect('/frc-report?propertyId='+req.body.propertyId+'&&startDate='+req.body.startDate+'&&endDate='+req.body.endDate);
		} else {
			return res.redirect('/report');
		}
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.ppmReport = async (req, res) => {
	try {
		res.locals = { title: 'Report', session: req.session };
		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		if (req.query.reportType == 1) {
			return res.redirect('/ppm-report?propertyId='+req.query.propertyId+'&&startDate='+req.query.startDate+'&&endDate='+req.query.endDate);
		} else if (req.query.reportType == 2) {
			return res.redirect('/frc-report?propertyId='+req.query.propertyId+'&&startDate='+req.query.startDate+'&&endDate='+req.query.endDate);
		}

		let schema = Joi.object({
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		const PropertyList = await Property.find({status: 1}).sort({property_name: 'asc'});

		const startDate = moment(req.query.startDate, 'DD-MM-YYYY');
		const endDate   = moment(req.query.endDate, 'DD-MM-YYYY');
		const range = moment.range(startDate, endDate);
		const dateRange = Array.from(range.by('days')).map(m => parseInt(m.format('DD')));
		const dayRange = Array.from(range.by('days')).map(m => m.format('dddd'));
		const dateMonthRange = Array.from(range.by('days')).map(m => m.format('DD-MM'));
		// let dateRange2 = Array.from(range.by('year', { step: 2 })); //with bi-annually years list

		let findQuery = { 
			propertyId: req.query.propertyId, 
			status: 1,
			createdAt: {
				$lte: moment(req.query.endDate, 'DD-MM-YYYY'),
			}
		}

		let PpmEquipmentAssetAssignData = await PpmEquipmentAssetAssign.find(findQuery).populate({path: 'assignPpmEquipmentId'});
		let PpmEquipmentAssetAssignDataArray = [];

		for (let i = 0; i < PpmEquipmentAssetAssignData.length; i++) {
			const element = PpmEquipmentAssetAssignData[i];

			if (frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum.Daily || frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum["Twice-a-day"] || frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum["Thrice-a-day"]) {
				// console.log('Daily==> ', i);
				PpmEquipmentAssetAssignDataArray.push(element)
			} else if (frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum.Weekly) {
				// console.log('Weekly==> ', i);
				if (dayRange.find(e => e == PpmEquipmentAssetAssignData[i].day)) {
					PpmEquipmentAssetAssignDataArray.push(element)
				}
			} else if (frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum.Fortnightly) {
				// console.log('Fortnightly==> ', i);
				let date1 = PpmEquipmentAssetAssignData[i].date
				let date2 = date1 < 15 ? date1 + 14 : date1 - 14;
				if (dateRange.find(e => e == date1) || dateRange.find(e => e == date2)) {
					PpmEquipmentAssetAssignDataArray.push(element)
				}
			} else if (frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum.Monthly) {
				// console.log('Monthly==> ', i);
				if (dateRange.find(e => e == PpmEquipmentAssetAssignData[i].date)) {
					PpmEquipmentAssetAssignDataArray.push(element)
				}
			} else if (frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum.Quarterly) {
				// console.log('Quarterly==> ', i);
				let Q1 = moment(PpmEquipmentAssetAssignData[i].date +'-'+ (PpmEquipmentAssetAssignData[i].month+1), 'DD-M').format('DD-M');
				let Q2 = moment(PpmEquipmentAssetAssignData[i].date +'-'+ (PpmEquipmentAssetAssignData[i].month+1), 'DD-M').add(3, 'M').format('DD-M');
				let Q3 = moment(PpmEquipmentAssetAssignData[i].date +'-'+ (PpmEquipmentAssetAssignData[i].month+1), 'DD-M').add(6, 'M').format('DD-M');
				let Q4 = moment(PpmEquipmentAssetAssignData[i].date +'-'+ (PpmEquipmentAssetAssignData[i].month+1), 'DD-M').add(9, 'M').format('DD-M');

				if (dateMonthRange.find(e => e == Q1) || dateMonthRange.find(e => e == Q2) || dateMonthRange.find(e => e == Q3) || dateMonthRange.find(e => e == Q4)) {
					PpmEquipmentAssetAssignDataArray.push(element)
				}
			}  else if (frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum.Annually) {
				// console.log('Annually==> ', i);
				let dateMonth = moment(PpmEquipmentAssetAssignData[i].date +'-'+ (PpmEquipmentAssetAssignData[i].month+1), 'DD-M').format('DD-M');

				if (dateMonthRange.find(e => e == dateMonth)) {
					PpmEquipmentAssetAssignDataArray.push(element)
				}
			}  else if (frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum["Bi-Annually"]) {
				// console.log('Bi-Annually==> ', i);
				let dateMonth = moment(PpmEquipmentAssetAssignData[i].date +'-'+ (PpmEquipmentAssetAssignData[i].month+1), 'DD-M').format('DD-M');

				if (dateMonthRange.find(e => e == dateMonth)) {
					PpmEquipmentAssetAssignDataArray.push(element)
				}
			}
		}

		return res.render('Admin/Reports/ppm-report', {
			data: req.query,
			PropertyList: PropertyList,
            PpmEquipmentAssetAssignData: PpmEquipmentAssetAssignDataArray,
            message: req.flash('message'),
            error: req.flash('error'),
        })
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.frcReport = async (req, res) => {
	try {
		res.locals = { title: 'FRC Report', session: req.session };
		res.locals.error = req.session.error ? req.session.error : '';
		req.session.error = '';

		if (req.query.reportType == 1) {
			return res.redirect('/ppm-report?propertyId='+req.query.propertyId+'&&startDate='+req.query.startDate+'&&endDate='+req.query.endDate);
		} else if (req.query.reportType == 2) {
			return res.redirect('/frc-report?propertyId='+req.query.propertyId+'&&startDate='+req.query.startDate+'&&endDate='+req.query.endDate);
		}

		let schema = Joi.object({
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}

		const PropertyList = await Property.find({status: 1}).sort({property_name: 'asc'});

		const startDate = moment(req.query.startDate, 'DD-MM-YYYY');
		const endDate   = moment(req.query.endDate, 'DD-MM-YYYY');
		const range = moment.range(startDate, endDate);
		const dateRange = Array.from(range.by('days')).map(m => parseInt(m.format('DD')));
		const dayRange = Array.from(range.by('days')).map(m => m.format('dddd'));
		const dateMonthRange = Array.from(range.by('days')).map(m => m.format('DD-MM'));
		// let dateRange2 = Array.from(range.by('year', { step: 2 })); //for bi-annually years list

		let findQuery = { 
			propertyId: req.query.propertyId, 
			status: 1,
			createdAt: {
				$lte: moment(req.query.endDate, 'DD-MM-YYYY'),
			}
		}
		let CategoryFrcAssignData = await CategoryFrcAssign.find(findQuery).populate({path: 'assignCategoryId', populate: {path: 'categoryId'}});
		let CategoryFrcAssignDataArray = [];

		// console.log(CategoryFrcAssignData);

		for (let i = 0; i < CategoryFrcAssignData.length; i++) {
			const element = CategoryFrcAssignData[i];

			if (frequencyEnum[CategoryFrcAssignData[i].frequency] == frequencyEnum.Daily || frequencyEnum[CategoryFrcAssignData[i].frequency] == frequencyEnum["Twice-a-day"] || frequencyEnum[CategoryFrcAssignData[i].frequency] == frequencyEnum["Thrice-a-day"]) {
				// console.log('Daily==> ', i);
				CategoryFrcAssignDataArray.push(element)
			} else if (frequencyEnum[CategoryFrcAssignData[i].frequency] == frequencyEnum.Weekly) {
				// console.log('Weekly==> ', i);
				if (dayRange.find(e => e == CategoryFrcAssignData[i].day)) {
					CategoryFrcAssignDataArray.push(element)
				}
			} else if (frequencyEnum[CategoryFrcAssignData[i].frequency] == frequencyEnum.Fortnightly) {
				// console.log('Fortnightly==> ', i);
				let date1 = CategoryFrcAssignData[i].date
				let date2 = date1 < 15 ? date1 + 14 : date1 - 14;
				if (dateRange.find(e => e == date1) || dateRange.find(e => e == date2)) {
					CategoryFrcAssignDataArray.push(element)
				}
			} else if (frequencyEnum[CategoryFrcAssignData[i].frequency] == frequencyEnum.Monthly) {
				// console.log('Monthly==> ', i);
				if (dateRange.find(e => e == CategoryFrcAssignData[i].date)) {
					CategoryFrcAssignDataArray.push(element)
				}
			} else if (frequencyEnum[CategoryFrcAssignData[i].frequency] == frequencyEnum.Quarterly) {
				// console.log('Quarterly==> ', i);
				let Q1 = moment(CategoryFrcAssignData[i].date +'-'+ (CategoryFrcAssignData[i].month+1), 'DD-M').format('DD-M');
				let Q2 = moment(CategoryFrcAssignData[i].date +'-'+ (CategoryFrcAssignData[i].month+1), 'DD-M').add(3, 'M').format('DD-M');
				let Q3 = moment(CategoryFrcAssignData[i].date +'-'+ (CategoryFrcAssignData[i].month+1), 'DD-M').add(6, 'M').format('DD-M');
				let Q4 = moment(CategoryFrcAssignData[i].date +'-'+ (CategoryFrcAssignData[i].month+1), 'DD-M').add(9, 'M').format('DD-M');

				if (dateMonthRange.find(e => e == Q1) || dateMonthRange.find(e => e == Q2) || dateMonthRange.find(e => e == Q3) || dateMonthRange.find(e => e == Q4)) {
					CategoryFrcAssignDataArray.push(element)
				}
			}  else if (frequencyEnum[CategoryFrcAssignData[i].frequency] == frequencyEnum.Annually) {
				// console.log('Annually==> ', i);
				let dateMonth = moment(CategoryFrcAssignData[i].date +'-'+ (CategoryFrcAssignData[i].month+1), 'DD-M').format('DD-M');

				if (dateMonthRange.find(e => e == dateMonth)) {
					CategoryFrcAssignDataArray.push(element)
				}
			}  else if (frequencyEnum[CategoryFrcAssignData[i].frequency] == frequencyEnum["Bi-Annually"]) {
				// console.log('Bi-Annually==> ', i);
				let dateMonth = moment(CategoryFrcAssignData[i].date +'-'+ (CategoryFrcAssignData[i].month+1), 'DD-M').format('DD-M');

				if (dateMonthRange.find(e => e == dateMonth)) {
					CategoryFrcAssignDataArray.push(element)
				}
			}
		}

		return res.render('Admin/Reports/frc-report', {
			data: req.query,
			PropertyList: PropertyList,
            CategoryFrcAssignData: CategoryFrcAssignDataArray,
            message: req.flash('message'),
            error: req.flash('error'),
        })
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}