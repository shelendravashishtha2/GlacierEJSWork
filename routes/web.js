const express = require("express");
const router = express.Router();

const PropertyController = require("../controllers/admin/PropertyController");
const UserController = require("../controllers/admin/UserController");
const ManageRatingController = require("../controllers/admin/ManageRatingController");
const PpmController = require("../controllers/admin/PpmController");
const TaskController = require("../controllers/admin/TaskController");
const SopController = require("../controllers/admin/SopController");
const HistoryController = require("../controllers/admin/HistoryController");
const CategoriesController = require("../controllers/admin/CategoriesController");
const SettingController = require("../controllers/admin/SettingController");

// router.use(function (req, res, next) {
// 	if (req.session.user) {
// 		next();
// 	} else {
// 		res.redirect('/login');
// 	}
// })

function isUserAllowed(req, res, next) {
	if (req.session.user) {
		next();
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
router.post('/update-property-status', isUserAllowed, PropertyController.updatePropertyStatus);
router.post('/update-property-wings-status', isUserAllowed, PropertyController.updatePropertyWingsStatus);
router.post('/delete-property-image', isUserAllowed, PropertyController.deletePropertyImage);
router.get('/view-properties/:id', isUserAllowed, PropertyController.propertyView);
router.get('/edit-properties/:id', isUserAllowed, PropertyController.propertyEdit);

// Categories Module
router.get('/categories', isUserAllowed, CategoriesController.categoryList); //category list
router.post('/change-category-status', isUserAllowed, CategoriesController.changeCategoryStatus); //change category status API
router.get('/create-categories', isUserAllowed, CategoriesController.categoryCreate); //create category
router.post("/category-store", isUserAllowed, CategoriesController.categoryAddValidationForm, CategoriesController.categoryAdd); // store category
router.get('/create-category-checklist/:id', isUserAllowed, CategoriesController.createChecklist); //create category vise checklist add 
router.get('/create-category-checklist', isUserAllowed, CategoriesController.createChecklist); //create category vise checklist add 
router.post('/store-category-checklist', isUserAllowed, CategoriesController.addChecklistAValidation, CategoriesController.storeChecklist); //store checklist
router.get('/edit-category-checklist/:id', isUserAllowed, CategoriesController.checklist); //edit category page with view category checklist list page
router.get('/master-frc', isUserAllowed, CategoriesController.frcChecklist); // FRC Checklist
router.post('/change-checklist-status', isUserAllowed, CategoriesController.changeChecklistStatus); //change category status API
router.post('/update-categories', isUserAllowed, CategoriesController.updateCategory); //update category
router.get('/edit-checklist-details/:id', isUserAllowed, CategoriesController.editChecklistDetails); //edit checklist details page
router.post('/update-checklist-details', isUserAllowed, CategoriesController.updateChecklistValidation, CategoriesController.updateChecklistDetails); //update checklist details    

router.get('/create-checklist-multi-form/:id', isUserAllowed, CategoriesController.createChecklistMultiForm); //create checklist multi form page
router.get('/view-checklist-multi-form/:id', isUserAllowed, CategoriesController.viewChecklistMultiForm); //create checklist multi form page
router.post('/update-form-create', isUserAllowed, CategoriesController.updateFormCreate); //create checklist multi form page
// router.get('/store-checklist-form', isUserAllowed, CategoriesController.storeChecklistForm); //store checklist multi form
// router.get('/edit-checklist-form', isUserAllowed, CategoriesController.editChecklistForm); //edit checklist page
// router.get('/update-checklist-form', isUserAllowed, CategoriesController.updateChecklistForm); //update checklist multiform page

// Users Module
router.get('/users', isUserAllowed, UserController.userList); //user list
router.get('/create-users', isUserAllowed, UserController.userCreate); //create user page
router.post("/user-add", isUserAllowed, UserController.userAddValidation, UserController.userAdd); // user registration
router.get('/edit-users/:id', isUserAllowed, UserController.userEdit); //edit user page
router.post('/update-user', isUserAllowed, UserController.userUpdateValidation, UserController.userUpdate); //update user
router.get('/view-users/:id', isUserAllowed, UserController.userView); //view user details
router.post('/update-user-status/', isUserAllowed, UserController.updateUserStatus); //view user details

// Task
router.get('/task', isUserAllowed, TaskController.taskList);
router.get('/property-task', isUserAllowed, TaskController.propertyUser);
router.get('/create-task', isUserAllowed, TaskController.createTask);
router.post('/create-task-submit', isUserAllowed, TaskController.createTaskSubmit);
router.post('/update-task-submit', isUserAllowed, TaskController.updateTaskSubmit);
router.get('/edit-task/:id', isUserAllowed, TaskController.editTask);
router.get('/view-task/:id', isUserAllowed, TaskController.viewTask);

// Manage Rating
router.get('/manage-rating', isUserAllowed, ManageRatingController.manageRatingList);
router.post('/add-group', isUserAllowed, ManageRatingController.addGroup);
router.post('/add-topic', isUserAllowed, ManageRatingController.addTopic);
router.post('/add-topic-checklist', isUserAllowed, ManageRatingController.addTopicChecklist);
router.post('/store-assign-groups', isUserAllowed, ManageRatingController.storeAssignAuditor);
router.get('/assign-auditor', isUserAllowed, ManageRatingController.assignAuditor);
router.get('/group-list', isUserAllowed, ManageRatingController.groupList);
router.get('/edit-assign-group', isUserAllowed, ManageRatingController.editGroup);
router.post('/update-assign-groups', isUserAllowed, ManageRatingController.updateAssignGroups); //update assign group
router.get('/edit-group-name/:id', isUserAllowed, ManageRatingController.editGroupName);
router.get('/edit-topic/:id', isUserAllowed, ManageRatingController.editTopic);
router.post('/update-group-status', isUserAllowed, ManageRatingController.updateGroupStatus); //
router.post('/update-rating-topic-status', isUserAllowed, ManageRatingController.updateRatingTopicStatus); // 
router.post('/update-topic-checklist-status', isUserAllowed, ManageRatingController.updateTopicChecklistStatus); //
router.post('/update-group-name', isUserAllowed, ManageRatingController.updateGroupName); //update group name
router.post('/update-topic-name', isUserAllowed, ManageRatingController.updateTopicName); //
router.get('/assign-group-list', isUserAllowed, ManageRatingController.assignGroupList); //
router.get('/assign-rating-task', isUserAllowed, ManageRatingController.assignRatingTask); // generate rating task
router.get('/view-group-assign-task', isUserAllowed, ManageRatingController.viewGroupAssignTask); //
router.get('/view-assign-task-checklist', isUserAllowed, ManageRatingController.viewAssignTaskChecklist); //

// PPM Master
router.get('/ppm', isUserAllowed, PpmController.PpmList);
router.get('/view-ppm', isUserAllowed, PpmController.viewPpmList);
router.get('/edit-ppm/:id', isUserAllowed, PpmController.editPpm);
router.post('/create-ppm', isUserAllowed, PpmController.createPpm);
router.post('/update-ppm-status', isUserAllowed, PpmController.updatePpmStatus);
router.post('/update-ppm-name', isUserAllowed, PpmController.updateppmEquipmentName);
router.post('/update-ppm-task', isUserAllowed, PpmController.updatePpmTask);
router.post('/update-property-wing-status', isUserAllowed, PpmController.updatePropertyWingStatus);
router.post('/update-ppm-task-status', isUserAllowed, PpmController.updatePpmTaskStatus);
router.get('/properties-wise-view-ppm/:id', isUserAllowed, PpmController.propertiesWisePpmList);
router.get('/ppm-details/:id/:pid', isUserAllowed, PpmController.ppmDetails);
// router.post('/edit-property-wing', isUserAllowed, PpmController.editPropertyWing);
router.get('/property-wing-list', isUserAllowed, PpmController.propertyWingList);
router.post('/store-assign-property-ppm-equipments', isUserAllowed, PpmController.addPropertyWing);
router.get('/assign-ppm', isUserAllowed, PpmController.assignPpmList);
router.get('/assign-ppm-equipment-asset-list/:pid/:id', isUserAllowed, PpmController.assignPpmEquipmentAssetList);
router.post('/update-assign-ppm-equipment-status', isUserAllowed, PpmController.updateAssignPpmEquipmentStatus);
router.post('/add-update-ppm-equipment-asset', isUserAllowed, PpmController.addUpdatePpmEquipmentAsset);
router.post('/update-assign-ppm-equipment-asset-status', isUserAllowed, PpmController.updateAssignPpmEquipmentAssetStatus);
router.get('/view-properties-ppm-task/:id', isUserAllowed, PpmController.viewPropertiesPpmTask);
router.get('/view-properties-ppm-task-details/:id', isUserAllowed, PpmController.viewPropertiesPpmTaskDetails);

// SOP
router.get('/sop', isUserAllowed, SopController.sopList);
router.get('/create-sop', isUserAllowed, SopController.createSop);
router.post('/store-sop', isUserAllowed, SopController.storeSop);
router.get('/edit-sop/:id', isUserAllowed, SopController.editSop);
router.post('/update-sop', isUserAllowed, SopController.updateSop);
router.post('/change-sop-status', isUserAllowed, SopController.changeSOPStatus); //change category status API
router.post('/delete-sop-image', isUserAllowed, SopController.deleteSopImage);
// router.post('/delete-sop/:id', isUserAllowed, SopController.deleteSop);
router.get('/view-sop/:id', isUserAllowed, SopController.viewSop);

// History 
router.get('/history', isUserAllowed, HistoryController.historyList);
router.get('/category-history/:id', isUserAllowed, HistoryController.categoryHistory);
router.get('/category-checklist-history', isUserAllowed, HistoryController.categoryChecklistHistory);
router.get('/view-checklist-history', isUserAllowed, HistoryController.viewChecklistHistory);

// Setting 
router.get('/setting', isUserAllowed, SettingController.settingList);
router.post('/store-rating-setting', isUserAllowed, SettingController.storeSetting);
router.post('/store-ppm-risk-assessment-color', isUserAllowed, SettingController.storePpmRiskAssessmentColor);
router.get('/delete-ppm-risk-assessment-color/:id', isUserAllowed, SettingController.deletePpmRiskAssessmentColor);

module.exports = router;