const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require("joi");
const MomentRange = require('moment-range');
const response = require("../../helper/response");
const { errorLog } = require("../../helper/consoleLog");
const PropertyResource = require('../resources/PropertyResource');
const PpmEquipment = require("../../models/PpmEquipmentMaster");
const PpmEquipmentAssign = require("../../models/PpmEquipmentAssign");
const PpmEquipmentAssetAssign = require("../../models/PpmEquipmentAssetAssign");
const Property = require("../../models/Property");
const PpmTaskAssign = require("../../models/PpmTaskAssign");
const daysEnum = require("../../enum/daysEnum");
const frequencyEnum = require("../../enum/frequencyEnum");

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

		console.log(req.body);

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
		
		let schema = Joi.object({
			propertyId: Joi.required(),
			startDate: Joi.required(),
			endDate: Joi.required(),
		});
		let validation = schema.validate(req.query, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, []));
		}
		console.log(req.query);

		const startDate = moment(req.query.startDate, 'DD-MM-YYYY');
		const endDate   = moment(req.query.endDate, 'DD-MM-YYYY');
		const range = moment.range(startDate, endDate);
		const dateRange = Array.from(range.by('days')).map(m => parseInt(m.format('DD')));
		const dayRange = Array.from(range.by('days')).map(m => m.format('dddd'));
		// let dateRange2 = Array.from(range.by('day', { step: 2 })); //with 2 day gap

		// console.log(dateRange);
		console.log(dayRange);
		
		// console.log(moment(req.query.endDate, 'DD-MM-YYYY').format('DD'));
		// console.log(acc);
		// console.log(dateRange);
		// console.log(dateRange.find(e => e == 8));
		// console.log(endDate.diff(startDate, 'months'));

		let findQuery = { 
			propertyId: req.query.propertyId, 
			// status: 1,
			// createdAt: {
			// 	$lte: moment(req.query.endDate, 'DD-MM-YYYY'),
			// },
			// date: {
			// 	$in: dateRange
			// }
		}
		// if (endDate.diff(startDate, 'months') > 0) {
		// 	findQuery.date = {
		// 		$gte: moment(req.query.endDate, 'DD-MM-YYYY').format('DD'),
		// 		$lte: moment(req.query.endDate, 'DD-MM-YYYY').format('DD')
		// 	}
		// }

		let PpmEquipmentAssetAssignData = await PpmEquipmentAssetAssign.find(findQuery);
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
				if (dateRange.find(e => e == PpmEquipmentAssetAssignData[i].date)) {
					PpmEquipmentAssetAssignDataArray.push(element)
				}
			}  else if (frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum.Annually) {
				// console.log('Annually==> ', i);
				if (dateRange.find(e => e == PpmEquipmentAssetAssignData[i].date)) {
					PpmEquipmentAssetAssignDataArray.push(element)
				}
			}  else if (frequencyEnum[PpmEquipmentAssetAssignData[i].frequency] == frequencyEnum["Bi-Annually"]) {
				// console.log('Bi-Annually==> ', i);
				if (dateRange.find(e => e == PpmEquipmentAssetAssignData[i].date)) {
					PpmEquipmentAssetAssignDataArray.push(element)
				}
			}

			
		}

		// let date1 = EquipmentAssetData.date
		// let date2 = date1 < 15 ? date1 + 14 : date1 - 14;

		// console.log(PpmEquipmentAssetAssignData);

		// let paramsCategoryId = req.query.search;
		// let allCategoryData = await CategoryMaster.find({status: 1});
		// let findQuery = { status: 1 }
		// if (req.query.search) {
		// 	findQuery.category_id = req.query.search
		// }
		// let CategoryChecklistData = await CategoryFrcMaster.find(findQuery).populate({path: 'category_id'}).sort({createdAt: 'desc'});
		// let PropertyList = await Property.find({status: 1}).sort({createdAt: 'desc'});

		return res.send(response.success(200, 'success', [{PpmEquipmentAssetAssignData}]));

		return res.render('Admin/Reports/ppm-report', {
            PpmEquipmentAssetAssignData: PpmEquipmentAssetAssignData,
            message: req.flash('message'),
            error: req.flash('error'),
        })
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}