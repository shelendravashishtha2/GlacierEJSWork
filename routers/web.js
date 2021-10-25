const validator = require('express-validator');
const PropertyController = require("../controllers/admin/PropertyController");
const UserController = require("../controllers/admin/UserController");
const ManageRatingController = require("../controllers/admin/ManageRatingController");
const PpmController = require("../controllers/admin/PpmController");
const TaskController = require("../controllers/admin/TaskController");
const SopController = require("../controllers/admin/SopController");
const HistoryController = require("../controllers/admin/HistoryController");
const CategoriesController = require("../controllers/admin/CategoriesController");

module.exports = function (app) {

    function isUserAllowed(req, res, next) {
        if (req.session.user) {
            return next();
        }
        else { res.redirect('/login'); }
    }

    app.get('/page-not-found',UserController.pageNotFound);

    app.get('/', function (req, res) {
        if(req.session.user){
            res.locals = { title: 'Dashboard', session: req.session};
            res.render('Dashboard/index');
        }else{
            res.redirect('/login');
        }
    });

    // Properties Module
    app.get('/properties', PropertyController.propertyList);
    app.get('/create-properties', PropertyController.propertyCreate);
    app.get('/edit-properties', PropertyController.propertyUpdate);
    app.get('/view-properties/:id', PropertyController.propertyView);
    app.get('/edit-properties/:id', PropertyController.propertyEdit);

	// Categories Module
    app.get('/categories', CategoriesController.categoryList); //category list
    app.get('/create-categories', CategoriesController.categoryCreate); //create category
	app.post("/category-store", CategoriesController.categoryAddValidation, CategoriesController.categoryAdd); // store category
	app.get('/create-category-checklist/:id', CategoriesController.createCheckList); //create category vise checklist add 
	app.post('/store-category-checklist', CategoriesController.storeChecklist); //store checklist
	app.get('/edit-category-checklist/:id', CategoriesController.checkList); //edit category page with view category check list page
    app.post('/update-categories', CategoriesController.updateCategory); //update category
	app.get('/edit-checklist-details/:id', CategoriesController.editChecklistDetails); //edit checklist details page
	app.post('/update-checklist-details', CategoriesController.updateChecklistDetails); //update checklist details
    app.get('/create-checklist-form/:id', CategoriesController.createChecklistForm); //create checklist multi form page
    // app.get('/store-checklist-form', CategoriesController.storeChecklistForm); //store checklist multi form
    // app.get('/edit-checklist-form', CategoriesController.editChecklistForm); //edit checklist page
    // app.get('/update-checklist-form', CategoriesController.updateChecklistForm); //update checklist multiform page

    // Users Module
    app.get('/users', isUserAllowed, UserController.userList); //user list
    app.get('/create-users', UserController.userCreate); //create user page
    app.get('/edit-users/:id', isUserAllowed, UserController.userEdit); //edit user page
    app.post('/update-user', isUserAllowed, UserController.userUpdate); //update user
    app.get('/view-users/:id', UserController.userView); //view user details

    // Task
    app.get('/task', TaskController.taskList);

    // Manage Rating
    app.get('/manage-rating', ManageRatingController.manageRatingList);

    // PPM Master
    app.get('/ppm', PpmController.PpmList);
    app.get('/view-ppm', PpmController.viewPpmList);
    app.get('/assign-ppm', PpmController.assignPpmList);
    app.get('/edit-ppm/:id', PpmController.editPpm);
    app.post('/create-ppm', PpmController.createPpm);
    app.post('/update-ppm-status', PpmController.updatePpmStatus);
    app.post('/update-ppm-name', PpmController.updatePpmName);
    app.post('/update-ppm-task', PpmController.updatePpmTask);
    app.post('/update-ppm-task-status', PpmController.updatePpmTaskStatus);
    app.get('/properties-wise-view-ppm/:id', PpmController.propertiesWisePpmList);
    app.get('/ppm-details', PpmController.ppmDetails);
    app.get('/edit-wing-category', PpmController.editWingCategory);


    // SOP
    app.get('/sop',SopController.sopList);
    app.get('/create-sop', SopController.createSop);
    app.post('/store-sop', SopController.storeSop);
    app.get('/edit-sop/:id', SopController.editSop);
    app.post('/update-sop', SopController.updateSop);
    // app.post('/delete-sop/:id', SopController.deleteSop);
    // app.get('/view-sop/:id', SopController.viewSop);

    // History 
    app.get('/history', HistoryController.historyList);

}