//config
var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware")

//routes
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find campground by, pass thru to template
    Campground.findById(req.params.id, function(err, campground){
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

//note to self, right now seed is deleting all comments/campgrounds upon app restart
router.post("/", middleware.isLoggedIn, function (req, res){
    //1. lookup campground using id
    Campground.findById(req.params.id, function(err, campground){
        if(err) {
            res.redirect("/campgrounds");
        } else {
            //2. create new comment(req.body.comment is entire comment object)
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    //3. connect new comment to campground and save
                    campground.comments.push(comment);
                    campground.save();
                    //redirect to show page
                    req.flash("success", "Successfully added comment");
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

//Edit      /dogs/:id/edit GET      Dog.findById() 
//req.params.id give us the id
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

//Update    /dogs/:id      PUT      Dog.findByIdAndUpdate() 
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
})

//destroy
//Destroy   /dogs/:id      DELETE   Dog.findByIdAndRemove()
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;