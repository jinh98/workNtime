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
        app.post('/register', (request, response, next) => {
            var post_data = request.body; //request 

            var plaint_password = post_data.password;
            var hash_data = saltHashPassword(plaint_password);//hash the password into a random salt
        
            var password = hash_data.passwordHash;
            var salt = hash_data.salt;

            var name = post_data.name;
            var email = post_data.email;
            var insertJson = {
                'email': email,
                'password': password,
                'salt':salt,
                'name':name
            };
            var db = client.db('edmtdevnodejs')//subject to change later this is the database

            //check exisiting email
            db.collection('user')//created in MongoDB (already created)
                .find({'email':email}).count(function(err, number){

                    //in the mongo db collection check for duplicate emails before normalization
                    if (number != 0){
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
        app.post('/login', (request, response, next)=>{
            var post_data = request.body; //request 

            var email = post_data.email;
            var userPassword= post_data.password;

            var db = client.db('edmtdevnodejs');

            //check for exisiting email
            db.collection('user')//created in MongoDB
                .find({'email':email}).count(function(err, number){
                    var salt = user.salt;//get salt
                    var hashed_password = checkHashPassword(user, password, salt).passwordHash; //hash password
                    var encrypted_password = user.password; //get pass from user
                    if (hashed_password == encrypted_password) { //authenticate
                        response.json('Login Success');
                        console.log('Login Success');
                    } else {
                        response.json('Wrong Password');
                        console.log('Wrong Password');
                    }

                });
        });

        //start web server
        app.listen(3000, ()=>{
            console.log('Connected to the MongoDB server, Port: 3000');
        })
    }
});
