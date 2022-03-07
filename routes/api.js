const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const AuthController = require("../controllers/api/AuthController");
const UserController = require("../controllers/api/UserController");
const SopController = require('../controllers/api/SopController');

const PropertyController = require("../controllers/api/operation-team/PropertyController");
const CategoryController = require('../controllers/api/operation-team/CategoryController');
const PpmController = require('../controllers/api/operation-team/PpmController');
const HistoryController = require('../controllers/api/operation-team/HistoryController');

const ManagerController = require('../controllers/api/manager/ManagerController');

const SupervisorController = require('../controllers/api/supervisor/SupervisorController');


// -----------------------------------------------------------------------------------------------------------------------

router.post("/register", AuthController.register); // user registration
router.post("/login", AuthController.login); // user login
router.post("/forgot-password", AuthController.forgotPassword); // Forget Password to send mail
router.post("/change-password", auth, UserController.changePasswordValidation,UserController.changePassword); // change password
router.post("/logout", auth, AuthController.logout); // user logout

router.get("/profile-details", auth, UserController.userProfile); // get user details
router.post("/profile-update", auth, UserController.updateUser); // profile update
router.post("/profile-image-upload", auth, UserController.profileImageUpload); // profile image upload

router.get("/dashboard-slider-image", UserController.dashboardSliderImage); // for dashboard images

// Property
router.post("/property-list", auth, PropertyController.propertyList); // property list
router.post("/property-list-with-rating", auth, PropertyController.propertyList); // property list with rating
router.post("/property-detail", auth, PropertyController.propertyDetail);
router.post("/property-wings-list", auth, PropertyController.propertyWingList);

// SOP
router.post("/sop-category-list", auth, SopController.sopCategoryList); // property list
router.post("/sop-category-detail", auth, SopController.categorySOPDetail);


// <<<--------------------------------------------- Operation-team Routes --------------------------------------------->>>
// router.post("/opt/logout", auth, AuthController.logout); // user login
// router.post("/opt/update", auth, AuthController.update); // user update
// router.post("/opt/dashboard", auth, AuthController.dashboard); // user dashboard

// --- User Module ---
router.post("/opt/add-users", auth, UserController.userAddValidation, UserController.addUsers); // supervisor and manager add
router.post("/opt/supervisor-list", auth, UserController.supervisorList); // supervisor list
router.post("/opt/manager-list", auth, UserController.managerList); // managers list
router.post("/opt/user-detail", auth, UserController.userDetail); // user details
router.post("/opt/user-status-active-inactive", auth, UserController.activeInactiveStatus); // user active - inactive

// --- Category Module ---
router.post("/opt/category-list", auth, CategoryController.categoryList);
router.post("/opt/category-wise-check-list", auth, CategoryController.categoryChecklist);
router.post("/opt/form-detail", auth, CategoryController.formDetail);
router.post("/opt/form-submit", auth, CategoryController.formSubmit);
router.post("/opt/form-submit-detail", auth, CategoryController.getFormSubmittedDetail);
router.post("/opt/form-list", auth, CategoryController.formList);

// --- PPM Module ---
router.post("/opt/ppm-equipment-list", auth, PpmController.ppmEquipmentList); // ppm equipment list after select property
router.post("/opt/create-ppm-equipment", auth, PpmController.createPpmEquipment); // ppm equipment list after select property
router.post("/opt/update-ppm-equipment", auth, PpmController.updatePpmEquipment); // ppm equipment list after select property
router.post("/opt/ppm-equipment-status-change", auth, PpmController.ppmEquipmentStatusChange); // Active - Inactive
router.post("/opt/ppm-asset-list", auth, PpmController.ppmAssetList); // ppm asset list after select equipment
router.post("/opt/create-ppm-asset", auth, PpmController.createPpmAsset); // create ppm asset
router.post("/opt/ppm-asset-details", auth, PpmController.ppmAssetDetails); //view details for edit model
router.post("/opt/update-ppm-asset", auth, PpmController.updatePpmAsset); // update ppm asset
router.post("/opt/ppm-asset-status-change", auth, PpmController.ppmAssetStatusChange); // Active - Inactive
router.post("/opt/ppm-task-list", auth, PpmController.ppmTaskList); //
router.post("/opt/ppm-task-details", auth, PpmController.ppmTaskDetails); //
// router.post("/opt/ppm-task-submit", auth, PpmController.ppmTaskDetails); //

// --- History Module ---
router.post("/opt/history-list", auth, HistoryController.historyList);
router.post("/opt/history-detail-list", auth, HistoryController.historyDetailList);
router.post("/opt/history-detail", auth, HistoryController.historyDetail);


// <<<--------------------------------------------- Manager Routes --------------------------------------------->>>
// router.post("/manager/logout", auth, AuthController.logout); // user login
// router.post("/manager/update", auth, AuthController.update); // user login
// router.post("/manager/dashboard", auth, AuthController.dashboard); // user dashboard

// router.get("/manager/assign-task-list", auth, ManagerController.assignTaskList);
// router.get("/manager/property-wing-list", auth, ManagerController.propertyWingList);
router.get("/manager/category-list", auth, ManagerController.categoryList);
router.get("/manager/category-frc-today-task-list", auth, ManagerController.categoryChecklist);
// router.get("/manager/category-frc-incomplete-task-list", auth, ManagerController.incompleteCategoryChecklist);
router.get("/manager/ppm-task-list", auth, ManagerController.ppmTaskList);
// router.get("/manager/ppm-task-detail", auth, ManagerController.ppmTaskDetail);
// router.get("/manager/ppm-list", auth, ManagerController.ppmList);
router.get("/manager/property-detail", auth, ManagerController.propertyDetail);
// router.get("/manager/supervisor-list", auth, ManagerController.supervisorList);
// router.get("/manager/user-detail", auth, ManagerController.userDetail);
// router.get("/manager/form-detail", auth, ManagerController.formDetail);
// router.get("/manager/history-list", auth, ManagerController.historyList);
// router.get("/manager/category-sop-list", auth, ManagerController.categorySOPList);
// router.get("/manager/category-sop-detail", auth, ManagerController.categorySOPDetail);
// router.get("/manager/history-detail-list", auth, ManagerController.historyDetailList);
// router.get("/manager/history-detail", auth, ManagerController.historyDetail);
// router.post("/manager/assign-supervisor", auth, ManagerController.assignSupervisor);
// router.post("/manager/form-submit", auth, ManagerController.formSubmit);
// router.get("/manager/form-submit-detail", auth, ManagerController.getFormSubmittedDetail);
// router.get("/manager/property-list-with-rating", auth, ManagerController.propertyListWithRating);
// router.get("/manager/formList", ManagerController.formList);
// router.post("/manager/updateRating", auth, ManagerController.updateRating)


// <<<--------------------------------------------- Supervisor Routes --------------------------------------------->>>
// router.post("/supervisor/logout", auth, AuthController.logout); // user login
// router.post("/supervisor/update", auth, AuthController.update); // user login
// router.get("/supervisor/assign-task-list", auth, SupervisorController.assignTaskList);
// router.get("/supervisor/property-wing-list", auth, SupervisorController.propertyWingList);
// router.get("/supervisor/category-list", auth, SupervisorController.categoryList);
// router.get("/supervisor/category-check-list", auth, SupervisorController.categoryChecklist);
// router.get("/supervisor/ppm-task-list", auth, SupervisorController.ppmTaskList);
// router.get("/supervisor/ppm-task-detail", auth, SupervisorController.ppmTaskDetail);
// router.get("/supervisor/ppm-list", auth, SupervisorController.ppmList);
// router.get("/supervisor/property-detail", auth, SupervisorController.propertyDetail);
// router.get("/supervisor/manager-list", auth, SupervisorController.managerList);
// router.get("/supervisor/user-detail", auth, SupervisorController.userDetail);
// router.get("/supervisor/form-detail", auth, SupervisorController.formDetail);
// router.get("/supervisor/history-list", auth, SupervisorController.historyList);
// router.get("/supervisor/category-sop-list", auth, SupervisorController.categorySOPList);
// router.get("/supervisor/category-sop-detail", auth, SupervisorController.categorySOPDetail);
// router.get("/supervisor/history-detail-list", auth, SupervisorController.historyDetailList);
// router.get("/supervisor/history-detail", auth, SupervisorController.historyDetail);
// router.post("/supervisor/form-submit", auth, SupervisorController.formSubmit);
// router.get("/supervisor/form-submit-detail", auth, SupervisorController.getFormSubmittedDetail);
// router.get("/supervisor/property-list-with-rating", auth, SupervisorController.propertyListWithRating);
// router.get("/supervisor/formList", SupervisorController.formList);
// router.post("/supervisor/updateRating", auth, SupervisorController.updateRating)

module.exports = router;