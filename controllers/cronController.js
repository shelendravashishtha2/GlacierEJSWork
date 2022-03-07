const PropertyTask = require('../models/CategoryAssign');
const CategoryChecklist = require('../models/CategoryFrcMaster');
const CategoryFrcAssignTask = require('../models/CategoryFrcAssignTask');
const PpmEquipmentAssetAssign = require('../models/PpmEquipmentAssetAssign');
const PpmTaskAssign = require('../models/PpmTaskAssign');
const daysEnum = require('../enum/daysEnum');
const frequencyEnum = require('../enum/frequencyEnum');
// const CategoryFrcAssignTask = require('../models/CategoryFrcAssignTask')

exports.formCron = async (req, res) => {
    try {
        console.log('cron running');
        const days = Object.keys(daysEnum);
        days= days.map((day)=>{
            return day.toLowerCase();    
        })
		let date = new Date();
		// date.setDate(date.getDate() + 7); //add 7 day in currant date

        const propertyTask = await PropertyTask.find();
        for (let task of propertyTask) {
            const managers = task.managerId;
            const supervisors = task.supervisorId;
            const categoryChecklist = await CategoryChecklist.find({
                category_id: task.categoryId,
            });

            for (let category of categoryChecklist) {
				if (category.frequency === 'daily') {
					console.log('daily');
					if (managers.length > 0) {
						for (let manager of managers) {
							const obj = {
								categoryChecklistId: category._id,
								categoryId: category.category_id,
								userId: manager,
								status: 0,
								completeDate: null,
								form: category.form,
								percentage: 0,
							};
							if (category.type === 'register') {
								const data = await CategoryFrcAssignTask.findOne({
									category_id:
										category.category_id,
									userId: manager,
								});
								if (!data) {
									await CategoryFrcAssignTask.create(obj);
									console.log(12333);
								} else {
									// await CategoryFrcAssignTask.create(obj);
									console.log(1233344444);
								}
							}
						}
					}
					if (supervisors.length > 0) {
						for (let supervisor of supervisors) {
							const obj = {
								categoryChecklistId: category._id,
								categoryId: category.category_id,
								userId: supervisor,
								status: 0,
								completeDate: null,
								form: category.form,
								percentage: 0,
							};
							if (category.type === 'register') {
								const data = await CategoryFrcAssignTask.findOne({
									category_id: category.category_id,
									userId: supervisor,
								});
								if (!data) {
									await CategoryFrcAssignTask.create(obj);
									console.log(12333);
								} else {
									// await CategoryFrcAssignTask.create(obj);
									console.log(1233344444);
								}
							}
						}
					}
                    
                } else if (category.frequency === 'monthly') {
                    if (date.getDate() == category.date) {
                        console.log('monthly');
                        if (managers.length > 0) {
                            for (let manager of managers) {
                                const obj = {
                                    categoryChecklistId: category._id,
                                    categoryId: category.category_id,
                                    userId: manager,
                                    status: 0,
                                    completeDate: null,
                                    form: category.form,
                                    percentage: 0,
                                };
                                if (category.type === 'register') {
                                    const data = await CategoryFrcAssignTask.findOne({
                                        category_id: category.category_id,
                                        userId: manager,
                                    });
                                    if (!data) {
                                        await CategoryFrcAssignTask.create(obj);
										console.log(12333);
                                    } else {
                                        // await CategoryFrcAssignTask.create(obj);
										console.log(1233344444);
                                    }
                                }
                            }
                        }
                        if (supervisors.length > 0) {
                            for (let supervisor of supervisors) {
                                const obj = {
                                    categoryChecklistId: category._id,
                                    categoryId: category.category_id,
                                    userId: supervisor,
                                    status: 0,
                                    completeDate: null,
                                    form: category.form,
                                    percentage: 0,
                                };
                                if (category.type === 'register') {
                                    const data = await CategoryFrcAssignTask.findOne({
                                        category_id: category.category_id,
                                        userId: supervisor,
                                    });
                                    if (!data) {
                                        await CategoryFrcAssignTask.create(obj);
										console.log(12333);
                                    } else {
                                        // await CategoryFrcAssignTask.create(obj);
										console.log(1233344444);
                                    }
                                }
                            }
                        }
                    }
                } else if (category.frequency === 'quarterly') {
                    if (
                        date.getMonth() == category.month &&
                        date.getDate() == category.date
                    ) {
                        console.log('quarterly');
                        if (managers.length > 0) {
                            for (let manager of managers) {
                                const obj = {
                                    categoryChecklistId: category._id,
                                    categoryId: category.category_id,
                                    userId: manager,
                                    status: 0,
                                    completeDate: null,
                                    form: category.form,
                                    percentage: 0,
                                };
                                if (category.type === 'register') {
                                    const data = await CategoryFrcAssignTask.findOne({
                                        category_id:  category.category_id,
                                        userId: manager,
                                    });
                                    if (!data) {
                                        await CategoryFrcAssignTask.create(obj);
										console.log(12333);
                                    } else {
                                        // await CategoryFrcAssignTask.create(obj);
										console.log(1233344444);
                                    }
                                }
                            }
                        }
                        if (supervisors.length > 0) {
                            for (let supervisor of supervisors) {
                                const obj = {
                                    categoryChecklistId: category._id,
                                    categoryId: category.category_id,
                                    userId: supervisor,
                                    status: 0,
                                    completeDate: null,
                                    form: category.form,
                                    percentage: 0,
                                };
                                if (category.type === 'register') {
                                    const data = await CategoryFrcAssignTask.findOne({
                                        category_id: category.category_id,
                                        userId: supervisor,
                                    });
                                    if (!data) {
                                        await CategoryFrcAssignTask.create(obj);
										console.log(12333);
                                    } else {
                                        // await CategoryFrcAssignTask.create(obj);
										console.log(1233344444);
                                    }
                                }
                            }
                        }
                    }
                } else if (category.frequency === 'annually') {
                    if (
                        date.getMonth() == category.month &&
                        date.getDate() == category.date
                    ) {
                        console.log('annually');
                        if (managers.length > 0) {
                            for (let manager of managers) {
                                const obj = {
                                    categoryChecklistId: category._id,
                                    categoryId: category.category_id,
                                    userId: manager,
                                    status: 0,
                                    completeDate: null,
                                    form: category.form,
                                    percentage: 0,
                                };
                                if (category.type === 'register') {
                                    const data = await CategoryFrcAssignTask.findOne({
                                        category_id: category.category_id,
                                        userId: manager,
                                    });
                                    if (!data) {
                                        await CategoryFrcAssignTask.create(obj);
										console.log(12333);
                                    } else {
                                        // await CategoryFrcAssignTask.create(obj);
										console.log(1233344444);
                                    }
                                }
                            }
                        }
                        if (supervisors.length > 0) {
                            for (let supervisor of supervisors) {
                                const obj = {
                                    categoryChecklistId: category._id,
                                    categoryId: category.category_id,
                                    userId: supervisor,
                                    status: 0,
                                    completeDate: null,
                                    form: category.form,
                                    percentage: 0,
                                };
                                if (category.type === 'register') {
                                    const data = await CategoryFrcAssignTask.findOne({
                                        category_id: category.category_id,
                                        userId: supervisor,
                                    });
                                    if (!data) {
                                        await CategoryFrcAssignTask.create(obj);
										console.log(12333);
                                    } else {
                                        // await CategoryFrcAssignTask.create(obj);
										console.log(1233344444);
                                    }
                                }
                            }
                        }
                    }
                } else if (category.frequency === 'bi-annually') {
                    if (
                        date.getMonth() == category.month &&
                        date.getDate() == category.date
                    ) {
                        console.log('bi-annually');
                        if (managers.length > 0) {
                            for (let manager of managers) {
                                const obj = {
                                    categoryChecklistId: category._id,
                                    categoryId: category.category_id,
                                    userId: manager,
                                    status: 0,
                                    completeDate: null,
                                    form: category.form,
                                    percentage: 0,
                                };
                                if (category.type === 'register') {
                                    const data = await CategoryFrcAssignTask.findOne({
                                        category_id: category.category_id,
                                        userId: manager,
                                    });
                                    if (!data) {
                                        await CategoryFrcAssignTask.create(obj);
										console.log(12333);
                                    } else {
                                        // await CategoryFrcAssignTask.create(obj);
										console.log(1233344444);
                                    }
                                }
                            }
                        }
                        if (supervisors.length > 0) {
                            for (let supervisor of supervisors) {
                                const obj = {
                                    categoryChecklistId: category._id,
                                    categoryId: category.category_id,
                                    userId: supervisor,
                                    status: 0,
                                    completeDate: null,
                                    form: category.form,
                                    percentage: 0,
                                };
                                if (category.type === 'register') {
                                    const data = await CategoryFrcAssignTask.findOne({
                                        category_id: category.category_id,
                                        userId: supervisor,
                                    });
                                    if (!data) {
                                        await CategoryFrcAssignTask.create(obj);
										console.log(12333);
                                    } else {
                                        // await CategoryFrcAssignTask.create(obj);
										console.log(1233344444);
                                    }
                                }
                            }
                        }
                    }
                } else if (category.frequency === 'weekly') {
                    if (days[date.getDay()] == category.day) {
                        if (managers.length > 0) {
                            for (let manager of managers) {
                                const obj = {
                                    categoryChecklistId: category._id,
                                    categoryId: category.category_id,
                                    userId: manager,
                                    status: 0,
                                    completeDate: null,
                                    form: category.form,
                                    percentage: 0,
                                };
                                if (category.type === 'register') {
                                    const data = await CategoryFrcAssignTask.findOne({
                                        category_id: category.category_id,
                                        userId: manager,
                                    });
                                    if (!data) {
                                        await CategoryFrcAssignTask.create(obj);
										console.log(12333);
                                    } else {
                                        // await CategoryFrcAssignTask.create(obj);
										console.log(1233344444);
                                    }
                                }
                            }
                        }
                        if (supervisors.length > 0) {
                            for (let supervisor of supervisors) {
                                const obj = {
                                    categoryChecklistId: category._id,
                                    categoryId: category.category_id,
                                    userId: supervisor,
                                    status: 0,
                                    completeDate: null,
                                    form: category.form,
                                    percentage: 0,
                                };
                                if (category.type === 'register') {
                                    const data = await CategoryFrcAssignTask.findOne({
                                        category_id: category.category_id,
                                        userId: supervisor,
                                    });
                                    if (!data) {
                                        await CategoryFrcAssignTask.create(obj);
										console.log(12333);
                                    } else {
                                        // await CategoryFrcAssignTask.create(obj);
										console.log(1233344444);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
		errorLog(__filename, 'task cron job', error);
    }
};

exports.ppmCron = async (req, res) => {
    // daysEnum;
    // frequencyEnum
	try {
		console.log('ppm cron running');
		const daysArray = Object.keys(daysEnum);
		let frequencyArray = Object.keys(frequencyEnum);
        let date = new Date();
		// date.addDays(7); //before 7 day task generate
		date.setDate(date.getDate() + 7);

		// let assignPpmEquipmentAssetData = await PpmEquipmentAssetAssign.find({status: 1}).populate({path: 'assignPpmEquipmentId', match: {status: 1}});
		let assignPpmEquipmentAssetData = await PpmEquipmentAssetAssign.find({status: 1});

		for (const EquipmentAssetData of assignPpmEquipmentAssetData) {
            if(EquipmentAssetData.frequency == frequencyArray[0] || EquipmentAssetData.frequency == frequencyArray[1] || EquipmentAssetData.frequency == frequencyArray[2] ){
                let counts = 1;
                if(EquipmentAssetData.frequency == frequencyArray[0]){
                    counts = 3;
                }else if(EquipmentAssetData.frequency == frequencyArray[1]){
                    counts = 2;
                }
                let records = [];
                console.log( `${EquipmentAssetData.frequency} generated task`);
                for(let i=0;i<counts;i++){
                    records.push({
                        propertyId: EquipmentAssetData.propertyId,
                        assignPpmEquipmentId: EquipmentAssetData.assignPpmEquipmentId,
                        assignPpmEquipmentAssetId: EquipmentAssetData._id,
                        assetName: EquipmentAssetData.assetName,
                        assetLocation: EquipmentAssetData.assetLocation,
                        vendorName: EquipmentAssetData.vendorName,
                        dueDate: date,
                        remark: `${EquipmentAssetData.frequency} generated task`,
                    });
                }
                await PpmTaskAssign.insertMany(records)
            }
			else if (EquipmentAssetData.frequency == frequencyArray[3]) { // Weekly
				if (EquipmentAssetData.day.toLowerCase() == daysArray[date.getDay()].toLowerCase()) {
					console.log('Weekly generate task');
					// console.log(EquipmentAssetData);

					await PpmTaskAssign.create({
						propertyId: EquipmentAssetData.propertyId,
						// ppmEquipmentId: EquipmentAssetData.ppmEquipmentId,
						assignPpmEquipmentId: EquipmentAssetData.assignPpmEquipmentId,
						assignPpmEquipmentAssetId: EquipmentAssetData._id,
						assetName: EquipmentAssetData.assetName,
						assetLocation: EquipmentAssetData.assetLocation,
						vendorName: EquipmentAssetData.vendorName,
						dueDate: date,
						// completionDate: '',
						// completionBy: '',
						// completionStatus: 1,
						remark: 'Weekly generate task',
						// attachPhotos: [''],
					})
				}
			} else if(EquipmentAssetData.frequency == frequencyArray[4]){ // Fortnightly
				let date1 = EquipmentAssetData.date
				let date2 = date1 < 15 ? date1 + 14 : date1 - 14;
				if (date.getDate() == date1 || date.getDate() == date2) {
					console.log('Fortnightly generate task');
					// console.log(EquipmentAssetData);

					await PpmTaskAssign.create({
						propertyId: EquipmentAssetData.propertyId,
						// ppmEquipmentId: EquipmentAssetData.ppmEquipmentId,
						assignPpmEquipmentId: EquipmentAssetData.assignPpmEquipmentId,
						assignPpmEquipmentAssetId: EquipmentAssetData._id,
						assetName: EquipmentAssetData.assetName,
						assetLocation: EquipmentAssetData.assetLocation,
						vendorName: EquipmentAssetData.vendorName,
						dueDate: date,
						// completionDate: '',
						// completionBy: '',
						// completionStatus: 1,
						remark: 'Fortnightly generate task',
						// attachPhotos: [''],
					})
				}
			} else if(EquipmentAssetData.frequency == frequencyArray[5]){ // Monthly
				if (date.getDate() == EquipmentAssetData.date) {
					console.log('Monthly generate task');
					// console.log(EquipmentAssetData);

					await PpmTaskAssign.create({
						propertyId: EquipmentAssetData.propertyId,
						// ppmEquipmentId: EquipmentAssetData.ppmEquipmentId,
						assignPpmEquipmentId: EquipmentAssetData.assignPpmEquipmentId,
						assignPpmEquipmentAssetId: EquipmentAssetData._id,
						assetName: EquipmentAssetData.assetName,
						assetLocation: EquipmentAssetData.assetLocation,
						vendorName: EquipmentAssetData.vendorName,
						dueDate: date,
						// completionDate: '',
						// completionBy: '',
						// completionStatus: 1,
						remark: 'Monthly generate task',
						// attachPhotos: [''],
					})
				}
			} else if(EquipmentAssetData.frequency == frequencyArray[6]){ // Quarterly
				let month = EquipmentAssetData.month; //1-12
				let setFirstQuarterMonth = 1;
				if (month < 4){ // quarter 1
					setFirstQuarterMonth = month;
				} else if (month < 7){ // quarter 2
					setFirstQuarterMonth = month - 3;
				} else if (month < 10){ // quarter 3
					setFirstQuarterMonth = month - 6;
				} else if (month < 13){ // quarter 4
					setFirstQuarterMonth = month - 9;
				}
				let quarter1 = setFirstQuarterMonth;
				let quarter2 = setFirstQuarterMonth + 3;
				let quarter3 = setFirstQuarterMonth + 6;
				let quarter4 = setFirstQuarterMonth + 9;
				let currentMonth = date.getMonth() + 1;

				if (currentMonth == quarter1 || currentMonth == quarter2 || currentMonth == quarter3 || currentMonth == quarter4) {
					if (date.getDate() == EquipmentAssetData.date) {
						console.log('Quarterly generate task');
						// console.log(EquipmentAssetData);

						await PpmTaskAssign.create({
							propertyId: EquipmentAssetData.propertyId,
							// ppmEquipmentId: EquipmentAssetData.ppmEquipmentId,
							assignPpmEquipmentId: EquipmentAssetData.assignPpmEquipmentId,
							assignPpmEquipmentAssetId: EquipmentAssetData._id,
							assetName: EquipmentAssetData.assetName,
							assetLocation: EquipmentAssetData.assetLocation,
							vendorName: EquipmentAssetData.vendorName,
							dueDate: date,
							// completionDate: '',
							// completionBy: '',
							// completionStatus: 1,
							remark: 'Quarterly generate task',
							// attachPhotos: [''],
						})
					}
				}
			} else if(EquipmentAssetData.frequency == frequencyArray[7]){ // Annually/ Yearly
				let currentMonth = date.getMonth() + 1;
				if (date.getDate() == EquipmentAssetData.date && currentMonth == EquipmentAssetData.month) {
					console.log('Annually generate task');
					// console.log(EquipmentAssetData);

					await PpmTaskAssign.create({
						propertyId: EquipmentAssetData.propertyId,
						// ppmEquipmentId: EquipmentAssetData.ppmEquipmentId,
						assignPpmEquipmentId: EquipmentAssetData.assignPpmEquipmentId,
						assignPpmEquipmentAssetId: EquipmentAssetData._id,
						assetName: EquipmentAssetData.assetName,
						assetLocation: EquipmentAssetData.assetLocation,
						vendorName: EquipmentAssetData.vendorName,
						dueDate: date,
						// completionDate: '',
						// completionBy: '',
						// completionStatus: 1,
						remark: 'Annually generate task',
						// attachPhotos: [''],
					})
				}
			} else if(EquipmentAssetData.frequency == frequencyArray[8]){ // Bi-Annually
				let month1 = EquipmentAssetData.month
				let month2 = month1 <= 6 ? month1 + 6 : month1 - 6;
				let currentMonth = date.getMonth() + 1;

				if (currentMonth == month1 || currentMonth == month2) {
					if (date.getDate() == EquipmentAssetData.date) {
						console.log('Bi-Annually generate task');
						// console.log(EquipmentAssetData);

						await PpmTaskAssign.create({
							propertyId: EquipmentAssetData.propertyId,
							// ppmEquipmentId: EquipmentAssetData.ppmEquipmentId,
							assignPpmEquipmentId: EquipmentAssetData.assignPpmEquipmentId,
							assignPpmEquipmentAssetId: EquipmentAssetData._id,
							assetName: EquipmentAssetData.assetName,
							assetLocation: EquipmentAssetData.assetLocation,
							vendorName: EquipmentAssetData.vendorName,
							dueDate: date,
							// completionDate: '',
							// completionBy: '',
							// completionStatus: 1,
							remark: 'Bi-Annually generate task',
							// attachPhotos: [''],
						})
					}
				}
			}
		}
	} catch (error) {
		console.log(error);
		errorLog(__filename, 'ppm cron job', error);
	}
}