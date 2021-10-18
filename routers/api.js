const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const AuthController = require("../controllers/api/AuthController");
const UserController = require("../controllers/api/UserController");
const PropertyController = require("../controllers/api/PropertyController");

router.post("/register", AuthController.registerValidation, AuthController.register); // user registration
router.post("/login", AuthController.login); // user login
router.post("/forgot-password", AuthController.forgotPassword); // Forget Password to send mail
router.post("/change-password", auth, UserController.changePasswordValidation,UserController.changePassword); // change password

router.get("/profile-details", auth, UserController.userProfile); // get user details
router.post("/profile-update", auth, UserController.updateUser); // profile update
router.post("/profile-image-upload", auth, UserController.profileImageUpload); // profile image upload

// Supervisor list
router.post("/supervisor-add", auth, UserController.supervisorAddValidation, UserController.supervisorAdd); // supervisor add
router.post("/supervisor-list", auth, UserController.supervisorList); // supervisor list

// Property
router.post("/property-list", auth, PropertyController.propertyList); // property list

module.exports = router;