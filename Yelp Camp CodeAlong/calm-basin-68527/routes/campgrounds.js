//config
var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware")

//routes
router.get('/', function(req, res){
    //get all compgrounds from DB
    Campground.find({}, function(err,campgrounds){
        if (err){
            console.log(err);
        } else {
            res.render('campgrounds/index', {campgrounds:campgrounds});
        }
    });
});

//campgrounds add route
router.post('/', middleware.isLoggedIn, function(req, res){
   //get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    //turn into an object so i can push into array
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    //create a new campground and save to db
    Campground.create(newCampground, function(err,newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
            //redirect back to campgrounds route
            res.redirect('/campgrounds');
        }
    });
});

//add campground form page
router.get('/new', middleware.isLoggedIn, function(req, res){
    res.render('campgrounds/new');
});

//show page
router.get("/:id", function(req, res){
    //find campground w/ provided ID- req.params.id
    //FindById method- (id, cb)
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if (err){
            console.log(err);
        } else {
             //render show template for that campground
            res.render('campgrounds/show', {campground: foundCampground});
        }
    });
});

//edit campground route
//does 
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function (err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//update campground route
//Update    /dogs/:id      PUT      Dog.findByIdAndUpdate()
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, 
    function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            //redirect to show
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//Destroy   /dogs/:id      DELETE   Dog.findByIdAndRemove() 
//form, removes it, redirect to show
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;