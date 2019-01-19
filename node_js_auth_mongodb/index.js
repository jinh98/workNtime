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
        console.log('Failed to connect to MongoDB server.Error', err); //error message when failed to connect
    }else{
        //register stuff
        app.post('/register', (request, reponse, next)=>{
            var post_data = request.body; //request 

            var plaint_password = post.data.password;
            var hash_Data = saltHashPassword(plaint_password);//hash the password into a random salt
        
            var password = hash_data.passworHash;
            var salt = hash_data.salt;

            var name = post_data.name;
            var email = post_data.email;
            var insertJson = {
                'email': email,
                'password': password,
                'salt':salt,
                'name':name
            };
            var db = client.db("edmtdevnode.js")//subject to change later this is the data base

            //check exisiting email
            db.collection('user')//created in MongoDB
                .find({'email':email}).count(function(err, number){

                    //in the mongo db collection check if the number of email are duplicate before normalization
                    if (number!=0){
                        response.json('Email already exists')
                        console.log('Email already exists');
                    }
                    else{
                        db.collection('user')
                            .insertOne(insertJson, function(error, res){
                                response.json('Registration Successful')
                                console.log('Registration Successful');
                            })
                    }
                });
        });

        //login stuff


        //login stuff







        //start web server
        app.listen(3000, ()=>{
            console.log('Connected to the MongoDB server, Port: 3000');
        })
    }
});
