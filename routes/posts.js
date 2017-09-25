var express = require('express');
var multer = require('multer');

var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var router = express.Router();

// Multer Config
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({ storage: storage });


// Get Add Page
router.get('/add', function(req, res, next) {
    var db = req.db;
    var categories = db.get('categories');
    categories.find({} , {} , function (err , categories) {
       if (err) throw  err ;
       res.render('addpost',{
           'categories' : categories
       })
   })
});


// Show Single Post
router.get('/show/:id', function (req , res , next) {
    var db = req.db;
    var post = db.get('posts');
    post.findOne({_id : req.params.id} , function (err , post) {
        res.render('show',{
            'title': post.title,
            'post' : post
        })
    })
});
// Add Comment To The Post
router.post('/addcomment' , function (req , res , next) {
    var name = req.body.name;
    var email = req.body.email;
    var body = req.body.body;
    var postId = req.body.postid;
    var commentDate = new Date();
    req.checkBody('name', 'Name Field Is Required').notEmpty();
    req.checkBody('email','Email Field Is Required').notEmpty();
    req.checkBody('email', ' Email Formatted Is not Correct').isEmail();
    req.checkBody('body', ' Body Field Is Required').notEmpty();
    req.checkBody('postid', 'Please Try Again').notEmpty();
    var db = req.db;
    var post = db.get('posts');
    var errors = req.validationErrors();
    if (errors){

        post.findOne({_id : postId} , function (err , post) {
            res.render('show',{
                'errors' : errors,
                'title': post.title,
                'post' : post
            })
        })
    } else {
        var comment = { "name" : name , "email" : email , "body" : body , "commentdate" : commentDate };
        post.update({
           "_id" : postId
        }, {
                $push : {
                "comments" : comment
                }
            }, function (err , doc) {
                if (err) {
                    throw  err;
                }   else {
                        req.flash('success','Comment Added');
                        res.location('/posts/show/'+ postId);
                        res.redirect('/posts/show/'+ postId);
                    }
            }

        );

    }



});
// Add Post With Uploading Image
router.post('/add',upload.single('mainimage') ,function (req , res , next) {
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var image = req.file;

    if (image) {
        var ProfileImageOriginalName = req.file.originalname;
        var ProfileImageName = req.file.mainimage;
        var ProfileImageMime = req.file.mimetype;
        var ProfileImagePath = req.file.path;
        var ProfileImageSize = req.file.size;
    } else {
        var ProfileImageOriginalName = 'noimage.png';
    }
    req.checkBody('title' , 'Title Field IS Required').notEmpty();
    req.checkBody('category' , 'Category Field IS Required').notEmpty();
    req.checkBody('body' , 'Body Field IS Required').notEmpty();
    req.checkBody('author' , 'Author Field IS Required').notEmpty();

    // Check Errors
    var errors = req.validationErrors();
    var db = req.db;

    if (errors) {
        var categories = db.get('categories');
        res.render('addpost',{
            "errors" : errors ,
            "title" : title ,
            "body" : body,
            "categories" : categories
        })
    } else {
        var posts = db.get('posts');
        posts.insert({
            "title" : title ,
            "category" : category ,
            "body" : body ,
            "author" : author,
            "image" : ProfileImageOriginalName
        }, function (err , post) {
            if (err) {
                res.send("there was Somw Issue");
            }else  {
                req.flash("success" , "Post Is added");
                res.location('/');
                res.redirect('/');
            }

        });
    }
});

module.exports = router;
