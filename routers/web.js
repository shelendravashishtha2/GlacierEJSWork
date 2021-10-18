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

    app.get('/', isUserAllowed, function (req, res) {
    res.locals = { title: 'Dashboard' };
    res.render('Dashboard/index');
    });

    // Propertys Module
    app.get('/propertys', isUserAllowed,PropertyController.propertyList);
    app.get('/create-propertys', isUserAllowed,PropertyController.propertyCreate);
    app.get('/edit-propertys', isUserAllowed,PropertyController.propertyUpdate);
    app.get('/view-propertys/:id', isUserAllowed,PropertyController.propertyView);

    // Categorys Module
    app.get('/categorys', isUserAllowed,PropertyController.propertyList);
    app.get('/create-categorys', isUserAllowed,PropertyController.propertyCreate);
    app.get('/edit-categorys', isUserAllowed,PropertyController.propertyUpdate);
    app.get('/view-categorys', isUserAllowed,PropertyController.propertyView);

    // Users Module
    app.get('/users', isUserAllowed,UserController.userList);
    app.get('/create-users', isUserAllowed,UserController.userCreate);
    app.get('/edit-users/:id', isUserAllowed,UserController.userUpdate);
    app.get('/view-users/:id', isUserAllowed,UserController.userView);

    // Task
    app.get('/task', isUserAllowed,TaskController.taskList);

    // Manage Rating
    app.get('/manage-rating', isUserAllowed,ManageRatingController.manageRatingList);

    // PPM Master
    app.get('/ppm', isUserAllowed,PpmController.PpmList);

    // SOP
    app.get('/sop', isUserAllowed,SopController.sopList);

    // History 
    app.get('/history', isUserAllowed,HistoryController.historyList);

}