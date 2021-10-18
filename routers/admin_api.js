const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const AuthController = require("../controllers/admin/AuthController");
const UserController = require("../controllers/admin/UserController");
const PropertyController = require("../controllers/admin/PropertyController");

router.post("/register", AuthController.registerValidation, AuthController.register); // user registration
router.post("/login", AuthController.login); // user login
router.post("/forgot-password", AuthController.forgotPassword); // Forget Password to send mail
router.post("/change-password", auth, UserController.changePasswordValidation,UserController.changePassword); // change password

router.get("/profile-details", auth, UserController.userProfile); // get user details
router.post("/profile-update", auth, UserController.updateUser); // update user by id
router.post("/profile-image-upload", auth, UserController.profileImageUpload); // profile image upload

// Supervisor list
router.post("/supervisor-add", auth, UserController.supervisorAddValidation, UserController.supervisorAdd); // user registration

// Supervisor list
router.post("/user-add", UserController.userAddValidation, UserController.userAdd); // user registration

// Property Name
router.post("/property-add", PropertyController.propertyAddValidation, PropertyController.propertyAdd); // property add
router.post("/property-list", PropertyController.propertyList); // property list

module.exports = router;