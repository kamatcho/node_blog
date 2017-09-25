var express = require('express');

var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var router = express.Router();

/* GET users listing. */
router.get('/add', function(req, res, next) {
    res.render('addcategory',{
        'title' : "Add Category"
    });
});

// Single Category

router.get('/show/:category' , function (req , res , next) {

    var db = req.db;
    var posts = db.get('posts');
    posts.find({category : req.params.category}, function (err , posts) {
        console.log(posts)
        res.render('index', {
            'posts' : posts
        })
    })
});

router.post('/add', function (req , res , next) {
  // var title = req.body.title;
    var title = req.body.title;
   console.log(title);
   var db = req.db;
   var categories = db.get('categories');
   req.checkBody('title','Title Is required').notEmpty();
   var errors = req.validationErrors();
   if (errors){
       res.render('addcategory', {
           'errors' : errors ,
           'title' : title
       })
       } else  {
       categories.insert({

           'title': title
       }, function (err , categories) {
           if (err) {
               console.log(err);
               res.send("There Is Some Error")
           } else {
               req.flash('Category Added Successfully');
               res.location('/');
               res.redirect('/');
           }
       }
   );

   }
});

module.exports = router;
