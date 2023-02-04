//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', ejs);

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/wikiDB", { useNewUrlParser: true });   //create connection and create DB
// mongoose.set('strictQuery', false);

const articleSchema = {
    title: String,
    content: String
};

const Article = mongoose.model("Article", articleSchema);     //creating mongoose model - when creating a model ( ביחיד ) in NodeJS it automatclly convert it to plural name (can be very different, person->people even).
/////////////////////requests trageting all articles//////////////////////
app.route("/articles")         //RESTfull API  
    .get(function(req,res){       //get all the articles in an API format
        Article.find(function(err,foundArticles){
            if (!err){
                res.send(foundArticles);          
            }else{
                res.send(err);
            }
        });
    })
    .post(function(req,res){        //insert new article to articles collection
        const newArticle = new Article({
                title: req.body.title,
                content: req.body.content
        });
        newArticle.save(function(err){
                if(!err){
                    res.send("Succesfully added a new article")
                }else{
                    res.send(err)
                }
        });
    })
    .delete(function(req,res){        
        Article.deleteMany(function(err){
            if(!err){
                res.send("Succesfully deleted all articles")
            }else{
                res.send(err)
            }
        });
    });

/////////////////////requests trageting specific article//////////////////////
app.route("/articles/:articleTitle")         //RESTfull API  
    .get(function(req,res){       //get all the articles in an API format
        Article.findOne({title: req.params.articleTitle},function(err,foundArticle){
            if (foundArticle){
                res.send(foundArticle);          
            }else{
                res.send("No Articles matching that title was found");
            }
        });
    })
    .put(function(req,res){       //replace the document intirelly
        const filter = { title: req.params.articleTitle };
        const updateDoc = {
                title: req.body.title,
                content: req.body.content
        };
        const options = { upsert: true };
        Article.updateMany(filter,updateDoc,options,function(err){
                                                    if(!err){
                                                        res.send("Sunccessfully updated article");
                                                    }
                                                }
        );
    })
    .patch(function(req,res){       //update only specific values in a document
        Article.updateMany(
            { title: req.params.articleTitle },
            { $set: req.body},       //dynamic- will update only the items that sent
            function(err){
                if(!err){
                    res.send("Sunccessfully updated article using patch");
                }else{
                    res.send(err);
                }
            }
        )
    })
    .delete(function(req,res){
        Article.deleteOne({ title: req.params.articleTitle },
                        function(err){
                            if(!err){
                                res.send("Sunccessfully deleted the article");
                            }else{
                                res.send(err);
                            }
                        })
    });


app.listen(3000, function(){
    console.log("Server started on port 3000");
});
