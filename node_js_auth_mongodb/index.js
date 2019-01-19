//Import packages installed from npm
var mongodb = require('mongodb');
var ObjectId = mongodb.ObjectID;
var crypto = require('crypto');
var express = require('express');
var bodyParser = require('body-parser');


//password stuff

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0, length);
};

var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt : salt,
        password : value
    };
};



function saltHashPassword (userPassword){
    var salt = genRandomString(16); // make 16 random character
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}

function checkHashPassword (userPassword, salt){
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//create MongoDB
var MongoClient = mongodb.MongoClient;

//connection 
var url = 'mongodb://localhost:27017'

MongoClient.connect(url, {useNewUrlParser: true}, function(err, client){
    if(err){
        console.log('Failed to connect to MongoDB server.Error', err);
    }else{
        //start web server
        app.listen(3000, ()=>{
            console.log('Connected to the MongoDB server, Port: 3000');
        })
    }
});
