var express = require('express');
var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var validator = require('express-validator');
const PropertyController = require("../controllers/admin/PropertyController");
const UserController = require("../controllers/admin/UserController");
const ManageRatingController = require("../controllers/admin/ManageRatingController");
const PpmController = require("../controllers/admin/PpmController");
const TaskController = require("../controllers/admin/TaskController");
const SopController = require("../controllers/admin/SopController");
const HistoryController = require("../controllers/admin/HistoryController");

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
    res.locals = { title: 'Dashboard' };
    res.render('Dashboard/index');
    });

    // Propertys Module
    app.get('/propertys', PropertyController.propertyList);
    app.get('/create-propertys', PropertyController.propertyCreate);
    app.get('/edit-propertys', PropertyController.propertyUpdate);
    app.get('/view-propertys/:id', PropertyController.propertyView);

    // Categorys Module
    app.get('/categorys', PropertyController.propertyList);
    app.get('/create-categorys', PropertyController.propertyCreate);
    app.get('/edit-categorys', PropertyController.propertyUpdate);
    app.get('/view-categorys', PropertyController.propertyView);

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