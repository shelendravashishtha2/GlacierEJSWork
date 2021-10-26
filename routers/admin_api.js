const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const AuthController = require("../controllers/admin/AuthController");
const UserController = require("../controllers/admin/UserController");
const PropertyController = require("../controllers/admin/PropertyController");
const SopController = require("../controllers/admin/SopController");
const CategoriesController = require("../controllers/admin/CategoriesController");

router.post("/register", AuthController.registerValidation, AuthController.register); // user registration
router.post("/login", AuthController.login); // user login
router.post("/forgot-password", AuthController.forgotPassword); // Forget Password to send mail
router.post("/change-password", auth, UserController.changePasswordValidation,UserController.changePassword); // change password

router.get("/profile-details", auth, UserController.userProfile); // get user details
router.post("/profile-update", auth, UserController.updateUser); // update user by id
router.post("/profile-image-upload", auth, UserController.profileImageUpload); // profile image upload

// Supervisor list
router.post("/supervisor-add", auth, UserController.supervisorAddValidation, UserController.supervisorAdd); // user registration

// Property Name
router.post("/property-list", PropertyController.propertyList); // property list
router.post("/property-add", PropertyController.propertyAddValidation, PropertyController.propertyAdd); // property add
router.post('/property-update', PropertyController.propertyUpdate); // property add

// Category name add
// router.post("/category-add", CategoriesController.categoryAddValidation, CategoriesController.categoryAdd); // category add

module.exports = router;