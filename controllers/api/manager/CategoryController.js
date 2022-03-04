const User = require("../../../models/User");
const CategoryAssign = require("../../../models/CategoryAssign");
const CategoryChecklist = require("../../../models/CategoryFrcMaster");
const Form = require("../../../models/Form");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const response = require("../../../helper/response");
const {errorLog} = require("../../../helper/consoleLog");
const Joi = require("joi");

exports.categoryList = async (req, res) => {
	try {
		let schema = Joi.object({
			propertyId: Joi.string().min(24).max(24).required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let categoryData = await CategoryAssign.find({propertyId: req.body.propertyId, managerId: req.user._id})
				.populate({path: 'categoryId', model: 'Category_Master'});

		categoryData = categoryData.map(function(i) { return i.categoryId; });

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "Category list",
		    data: categoryData
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}
exports.categoryChecklist = async (req, res) => {
	try {
		let schema = Joi.object({
			categoryId: Joi.string().min(24).max(24).required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let condition = {"$match": {category_id: ObjectId(req.body.categoryId),status:1}};
		let lookup = {
        	$lookup: {
                from: 'forms',
                let: {
                    id: "$_id"
                },
                pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                        $eq: ["$categoryChecklistId", "$$id"]
                                    },
                                    {
                                        $eq: [ObjectId(req.user._id), "$userId"]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id:1,
                            percentage: 1
                        }
                    }
                ],
                as: 'percentage',
            }
        }
        let unwind = {
            $unwind: {
                path: "$percentage",
                preserveNullAndEmptyArrays: true
            }
        }
        let project = {
			$project:{
				checklist_name:"$checklist_name",
				//percentage:{ $ifNull: [ "$percentage.percentage", 0 ] }
			}
		}
		let categoryChecklistData = await CategoryChecklist.aggregate([condition/*,lookup,unwind*/,project]);
		categoryChecklistData = JSON.parse(JSON.stringify(categoryChecklistData));
		for(let i=0;i<categoryChecklistData.length;i++){
			let form = await Form.findOne({categoryChecklistId:categoryChecklistData[i]._id,userId:req.user._id}).sort({createdAt:-1});
			if(form){
				categoryChecklistData[i].percentage = form.percentage;
			}else{
				categoryChecklistData[i].percentage = 0;
			}
		}

		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "Category wise checklist",
		    data: categoryChecklistData
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.formDetail = async (req, res) => {
	try {
		let schema = Joi.object({
			CategoryChecklistId: Joi.string().min(24).max(24).required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let formDetail = await CategoryChecklist.findOne({_id:req.body.CategoryChecklistId},{form:1});
		if (!formDetail) {
			return res.send(response.error(400, "Category Checklist not found", [] ));
		}
		return res.status(200).send({
		    "status": true,
            "status_code": "200",
            "message": "Checklist form details",
		    data: [formDetail]
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.getFormSubmitedDetail = async (req, res) => {
	try {
		let schema = Joi.object({
			formId: Joi.string().min(24).max(24).required()
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let formDetail = await Form.findOne({_id:req.body.formId})
		return res.status(200).send({
		    "status": true,
			"status_code": "200",
			"message": "Checklist form submit details",
		    data: formDetail
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.formSubmit = async (req, res) => {
	try {
		let schema = Joi.object({
			formId: Joi.string().min(24).max(24).optional(),
			categoryId: Joi.string().min(24).max(24).required(),
			categoryChecklistId: Joi.string().min(24).max(24).required(),
			userId: Joi.string().min(24).max(24).required(),
			form: Joi.optional(),
		});
		let validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}
		let formDetail = await Form.findOne({_id:req.body.formId})
		if(formDetail){
			formDetail = await Form.findOne({_id:req.body.formId})
		}else{
			formDetail = new Form;
			formDetail.categoryId = req.body.categoryId;
			formDetail.categoryChecklistId = req.body.categoryChecklistId;
			formDetail.userId = req.body.userId;
		}
		formDetail.form = req.body.form;
		let percentage = 0;
		let array = ["button","paragraph","header"];
		let count = 0;
		let completeCount = 0;
		for(let i=0;i<req.body.form.length;i++){
			if(array.indexOf(req.body.form[i].type) == -1){
				count++;
				if(req.body.form[i].value && req.body.form[i].value.length > 0){
					completeCount++;
				}
			}
		}
		formDetail.percentage = Math.ceil((completeCount * 100)/count);
		await formDetail.save()
		return res.status(200).send({
		    "status": true,
			"status_code": "200",
			"message": "Checklist form submit",
		    data: formDetail
		});
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.formList = async (req, res) => {
	try {
		const startDate = new Date("2021-11-10")
		const endDate = new Date("2021-11-20")

		//const startDate = new Date(req.body.startDate)
		//const endDate = new Date(req.body.endDate)

		const list = await Form.find({$and:[{createdAt:{$gte: startDate}},{endDate:{$lte: endDate}}]})
		if (!list) {
			return res.send(response.error(400, "FormList not found", [] ))
		}
		return res.status(200).send({
			"status": true,
			"status_code": "200",
			"formList": list
		});		
	} catch (error) {
		console.log(error);
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}