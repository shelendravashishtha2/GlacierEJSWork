const express = require("express");
const router = express.Router();

const validator = require('express-validator');
const AuthController = require('../controllers/admin/AuthController');
const PropertyController = require("../controllers/admin/PropertyController");
const UserController = require("../controllers/admin/UserController");
const ManageRatingController = require("../controllers/admin/ManageRatingController");
const PpmController = require("../controllers/admin/PpmController");
const TaskController = require("../controllers/admin/TaskController");
const SopController = require("../controllers/admin/SopController");
const HistoryController = require("../controllers/admin/HistoryController");
const CategoriesController = require("../controllers/admin/CategoriesController");
const SettingController = require("../controllers/admin/SettingController");

function isUserAllowed(req, res, next) {
	if (req.session.user) {
		return next();
	} else {
		res.redirect('/login');
	}
}

router.get('/page-not-found', UserController.pageNotFound);

router.get('/', isUserAllowed, PropertyController.dashboardIndex);

// Properties Module
router.get('/properties', isUserAllowed, PropertyController.propertyList);
router.get('/properties-wise-completed-uncompleted-task', isUserAllowed, PropertyController.completedUncompletedCategory);
router.get('/create-properties', isUserAllowed, PropertyController.propertyCreate);
router.get('/edit-properties', isUserAllowed, PropertyController.propertyUpdate);
router.post('/update-property-status', PropertyController.updatePropertyStatus);
router.post('/update-property-wings-status', PropertyController.updatePropertyWingsStatus);
router.post('/delete-property-image', PropertyController.deletePropertyImage);
router.get('/view-properties/:id', isUserAllowed, PropertyController.propertyView);
router.get('/edit-properties/:id', isUserAllowed, PropertyController.propertyEdit);

// Categories Module
router.get('/categories', CategoriesController.categoryList); //category list
router.post('/change-category-status', CategoriesController.changeCategoryStatus); //change category status API
router.get('/create-categories', CategoriesController.categoryCreate); //create category
router.post("/category-store", CategoriesController.categoryAddValidationForm, CategoriesController.categoryAdd); // store category
router.get('/create-category-checklist/:id', CategoriesController.createCheckList); //create category vise checklist add 
router.get('/create-category-checklist', CategoriesController.createCheckList); //create category vise checklist add 
router.post('/store-category-checklist', CategoriesController.addCheckListAValidation ,CategoriesController.storeChecklist); //store checklist
router.get('/edit-category-checklist/:id', CategoriesController.checkList); //edit category page with view category checklist list page
router.get('/master-frc', CategoriesController.frcCheckList); // FRC Chicklist
router.post('/change-checklist-status', CategoriesController.changeChecklistStatus); //change category status API
router.post('/update-categories', CategoriesController.updateCategory); //update category
router.get('/edit-checklist-details/:id', CategoriesController.editChecklistDetails); //edit checklist details page
router.post('/update-checklist-details', CategoriesController.updateChecklistValidation, CategoriesController.updateChecklistDetails); //update checklist details    

router.get('/create-checklist-multi-form/:id', CategoriesController.createChecklistMultiForm); //create checklist multi form page
router.get('/view-checklist-multi-form/:id', CategoriesController.viewChecklistMultiForm); //create checklist multi form page
router.post('/update-form-create', CategoriesController.updateFormCreate); //create checklist multi form page
// router.get('/store-checklist-form', CategoriesController.storeChecklistForm); //store checklist multi form
// router.get('/edit-checklist-form', CategoriesController.editChecklistForm); //edit checklist page
// router.get('/update-checklist-form', CategoriesController.updateChecklistForm); //update checklist multiform page

// Users Module
router.get('/users', isUserAllowed, UserController.userList); //user list
router.get('/create-users', UserController.userCreate); //create user page
router.post("/user-add", UserController.userAddValidation, UserController.userAdd); // user registration
router.get('/edit-users/:id', isUserAllowed, UserController.userEdit); //edit user page
router.post('/update-user', isUserAllowed, UserController.userUpdateValidation, UserController.userUpdate); //update user
router.get('/view-users/:id', isUserAllowed, UserController.userView); //view user details
router.post('/update-user-status/', isUserAllowed, UserController.updateUserStatus); //view user details

// Task
router.get('/task', isUserAllowed,TaskController.taskList);
router.get('/property-task', isUserAllowed,TaskController.propertyUser);
router.get('/create-task', isUserAllowed,TaskController.createTask);
router.post('/create-task-submit',TaskController.createTaskSubmit);
router.post('/update-task-submit',TaskController.updateTaskSubmit);
router.get('/edit-task/:id', isUserAllowed,TaskController.editTask);
router.get('/view-task/:id', isUserAllowed,TaskController.viewTask);

// Manage Rating
router.get('/manage-rating', ManageRatingController.manageRatingList);
router.post('/add-group', ManageRatingController.addGroup);
router.post('/add-topic', ManageRatingController.addTopic);
router.post('/add-topic-checklist', ManageRatingController.addTopicChecklist);
router.post('/store-assign-auditor', ManageRatingController.storeAssignAuditor);
router.get('/assign-auditor', ManageRatingController.assignAuditor);
router.get('/group-list', ManageRatingController.groupList);
router.get('/edit-group', ManageRatingController.editGroup);
router.get('/edit-group-name/:id', ManageRatingController.editGroupName);
router.get('/edit-topic/:id', ManageRatingController.editTopic);
router.post('/update-group-status', ManageRatingController.updateGroupStatus); // jayesh
router.post('/update-rating-topic-status', ManageRatingController.updateRatingTopicStatus); // jayesh 
router.post('/update-topic-checklist-status', ManageRatingController.updateTopicChecklistStatus); // jayesh
router.post('/update-groupname', ManageRatingController.updateGroupName); //update group name - jayesh
router.post('/update-topic-name', ManageRatingController.updateTopicName); //update topic name - jayesh

// PPM Master
router.get('/ppm', PpmController.PpmList);
router.get('/view-ppm', PpmController.viewPpmList);
router.get('/edit-ppm/:id', PpmController.editPpm);
router.post('/create-ppm', PpmController.createPpm);
router.post('/update-ppm-status', PpmController.updatePpmStatus);
router.post('/update-ppm-name', PpmController.updateppmEquipmentName);
router.post('/update-ppm-task', PpmController.updatePpmTask);
router.post('/update-property-wing-status', PpmController.updatePropertyWingStatus);
router.post('/update-ppm-task-status', PpmController.updatePpmTaskStatus);
router.get('/properties-wise-view-ppm/:id', PpmController.propertiesWisePpmList);
router.get('/ppm-details/:id/:pid', PpmController.ppmDetails);
router.get('/edit-wing-category/:pid/:id', PpmController.editWingCategory);
router.post('/edit-property-wing', PpmController.editPropertyWing);
router.get('/property-wing-list', PpmController.propertyWingList);
router.get('/property-equipments-list', PpmController.propertyEquipmentsList);
router.post('/store-assign-property-ppm-equipments', PpmController.addPropertyWing);
router.get('/assign-ppm', PpmController.assignPpmList);
router.get('/assign-ppm-equipment-asset-list/:pid/:id', PpmController.assignPpmEquipmentAssetList);
router.post('/update-assign-ppm-equipment-status', PpmController.updateAssignPpmEquipmentStatus);
router.post('/add-update-ppm-equipment-asset', PpmController.addUpdatePpmEquipmentAsset);
router.post('/update-assign-ppm-equipment-asset-status', PpmController.updateAssignPpmEquipmentAssetStatus);
router.get('/view-properties-ppm-task/:id', PpmController.viewPropertiesPpmTask);
router.get('/view-properties-ppm-task-details/:id', PpmController.viewPropertiesPpmTaskDetails);

// SOP
router.get('/sop', isUserAllowed, SopController.sopList);
router.get('/create-sop', isUserAllowed, SopController.createSop);
router.post('/store-sop', isUserAllowed, SopController.storeSop);
router.get('/edit-sop/:id', isUserAllowed, SopController.editSop);
router.post('/update-sop', isUserAllowed, SopController.updateSop);
router.post('/change-sop-status', SopController.changeSOPStatus); //change category status API
router.post('/delete-sop-image', isUserAllowed, SopController.deleteSopImage);
// router.post('/delete-sop/:id', isUserAllowed, SopController.deleteSop);
router.get('/view-sop/:id', isUserAllowed, SopController.viewSop);

// History 
router.get('/history', HistoryController.historyList);
router.get('/category-history/:id', HistoryController.categoryHistory);
router.get('/category-checklist-history', HistoryController.categoryChecklistHistory);
router.get('/view-checklist-history', HistoryController.viewChecklistHistory);

// Setting 
router.get('/setting', isUserAllowed, SettingController.settingList);
router.post('/store-rating-setting', isUserAllowed, SettingController.storeSetting);
router.post('/store-ppm-risk-assessment-color', isUserAllowed, SettingController.storePpmRiskAssessmentColor);
router.get('/delete-ppm-risk-assessment-color/:id', isUserAllowed, SettingController.deletePpmRiskAssessmentColor);

module.exports = router;