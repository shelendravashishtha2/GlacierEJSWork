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
        sess = req.session;
        if (sess.user) {
                return next();
        }
        else { res.redirect('/login'); }
    }

    app.get('/page-not-found',UserController.pageNotFound);

    app.get('/', function (req, res) {
        if(req.session.user){
            res.locals = { title: 'Dashboard' ,session:req.session};
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
	// app.post('/update-checklist-details', CategoriesController.updateChecklistDetails); //update checklist details
    // app.get('/create-checklist-form', CategoriesController.categoryView); //create checklist multi form page
    // app.get('/store-checklist-form', CategoriesController.categoryView); //store checklist multi form
    // app.get('/edit-checklist-form', CategoriesController.categoryView); //edit checklist page
    // app.get('/update-checklist-form', CategoriesController.categoryView); //update checklist multiform page

    // Users Module
    app.get('/users', UserController.userList);
    app.get('/create-users', UserController.userCreate);
    app.get('/edit-users/:id', UserController.userUpdate);
    app.get('/view-users/:id', UserController.userView);

    // Task
    app.get('/task', TaskController.taskList);

    // Manage Rating
    app.get('/manage-rating', ManageRatingController.manageRatingList);

    // PPM Master
    app.get('/ppm', PpmController.PpmList);

    // SOP
    app.get('/sop', SopController.sopList);
    app.get('/create-sop', SopController.createSop);
    app.post('/store-sop', SopController.storeSop);
    app.get('/edit-sop/:id', SopController.editSop);
    app.post('/update-sop', SopController.updateSop);
    // app.post('/delete-sop/:id', SopController.deleteSop);
    // app.get('/view-sop/:id', SopController.viewSop);

    // History 
    app.get('/history', HistoryController.historyList);

}