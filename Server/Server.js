const express = require("express");
const cors = require("cors");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
require('dotenv').config();
const fileUpload = require('express-fileupload');
var app = express();

var mysql = require('mysql');

var pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'Photoshare'
});


//Wrapped the db.open
let opendb = () => {
  pool.connect((err) => {

    if (err) {
      console.log("Cannot connect");
      return console.error(err.message);
    }
    console.log('Connected to the mysql database.');
  });
}

//Wrapped the db.close
let closedb = () => {
  pool.end((err) => {

    if (err) {
      console.log("Cannot close ");
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

function hashCode(str) {
  return str.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
}

app.use(cors());
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({
  extended: true
})) // for parsing application/x-www-form-urlencoded
app.use(fileUpload());


/*
Request Test
*/
app.route("/")
  .post(function (req, res, next) {
    console.log("POST received on /");
    res.send('POST request to homepage');
    next();
  }).get(function (req, res, next) {
    console.log("GET received on /");
    res.send('GET request to homepage');
    next();
  });

/*
Credential verification POST request handler
returns user id if user has been successfully created returns 0 otherwise
*/
app.route("/user")
  .post(function (req, res, next) {
    console.log("POST recieved to /user");
    let credentials = req.body;
    let sql = `SELECT USER_ID
      FROM users
      WHERE USERNAME = "${credentials.user}"`;
    //execute querys
    pool.query(sql, (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.error(err.message);
      }
      if(row.length){
        console.log("User found : confirming pasword");
        console.log(row[0].USER_ID);
        let sql = `SELECT USER_ID
          FROM credentials
          WHERE PASSWORD = "${credentials.password}"
          AND USER_ID =${row[0].USER_ID}`;
        pool.query(sql, function(err, row){
          if(err){
            res.status(500).send(err);
            console.error(err.message);
          } 
          if(row.length){
            console.log("Password Matched : Returning User ID");
            res.json(row[0].USER_ID);
          } else {
            console.log("Password not matching");
            res.json(0);
          }
        });
      } else {
        console.log("User not found");
        res.json(0);
      }
    })
  });

/*
Credential registration POST request handler
returns user id if user has been successfully created returns 0 otherwise
*/
app.route("/createUser")
  .post(function (req, res, next) {
    console.log("POST recieved to /createUser");
    let credentials = req.body;
    let userId = hashCode(credentials.user);
    let sql = `SELECT USER_ID
      FROM users
     WHERE USER_ID = "${userId}"`;
    pool.query(sql, (err, row) => {
      if (err) {
        res.status(500).send(err);
        return console.error(err.message);
      }
      if (row[0] == undefined) {
        console.log("User not found : Creating new user");
        let sql = `INSERT INTO users(USER_ID, USERNAME)
          VALUES (${userId},"${credentials.user}")`;
        pool.query(sql, (err) => {
          if (err) {
            return console.error(err.message);
          } else {
            console.log("Saving Credentials");
            let sql = `INSERT INTO credentials(USER_ID, PASSWORD)
              VALUES (${userId},"${credentials.password}")`;
            pool.query(sql, function(err) {
              if(err){
                return console.error(err.message);
              }
            });
          }
        });
        res.json(userId);
      } else {
        res.json(0);
      }
    });
  });

/*
Image upload POST request handler
*/
app.route("/uploadImage")
  .post(function (req, res, next){
    console.log('POST recieved to /uploadImage');
    if(!req.files || Object.keys(req.files).lenghth === 0 ){
      console.log("File not received");
      return res.status(400).send();
    }
    let buffer = Buffer.from(req.files['data']['data']);
    let arraybuffer = Uint8Array.from(buffer).buffer;
    var query = "INSERT INTO photos SET ?", values = {
        USER_ID:req.body['USER_ID'],
        IMAGE: buffer,
        TITLE:req.body['Title'],
        DATE: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
    pool.query(query,values,(err) =>{
      if (err) {
        res.status(500).send(err);
        return console.error(err.message);
      }
      console.log("Upload successful");
      res.send("Success");
    });
  });

/*
Avatar upload POST request Handler
*/
app.route('/uploadAvatar')
  .post(function(req, res, next){
    if(!req.files || Object.keys(req.files).lenghth === 0 ){
      console.log("File not received");
      return res.status(400).send();
    }
    let buffer = Buffer.from(req.files['data']['data']);
    let arraybuffer = Uint8Array.from(buffer).buffer;
    var sql = `UPDATE users SET ? WHERE USER_ID=${req.body['USER_ID']}`, values = {
      avatar:buffer
    };
    pool.query(sql,values,(err) =>{
      if (err) {
        res.status(500).send(err);
        return console.error(err.message);
      }
      console.log("Upload successful");
      res.send("Success");
    });
  });


/*
Image download POST request handler
*/
app.route('/userImages')
  .post(function(req, res, next){
    console.log('POST recieved to /userImages');
    let sql = `SELECT * 
      FROM photos 
      LEFT OUTER JOIN users ON photos.USER_ID=users.USER_ID 
      ORDER BY DATE 
      DESC LIMIT ${req.body['INDEX']},3;`
    pool.query(sql ,(err,row) => {
      if (err) {
        res.status(500).send(err);
        return console.error(err.message);
      }
      console.log(row);
      res.send(row);
    });
  });

/*
User search POST request handler
*/
app.route('/userSearch')
  .post(function(req, res, next){
    console.log("POST recieved to /userSearch");
    let sql= '';
    if(req.body['by_ID'] == 0){
      if(req.body['exact_match'] == 0){
        sql = `SELECT * 
          FROM users
          WHERE soundex(username) = soundex("${req.body['username']}")`;
      } else {
        sql = `SELECT * 
          FROM users
          WHERE username="${req.body['username']}"`;
      }
    } else{
      sql = `SELECT * 
          FROM users
          WHERE USER_ID = "${req.body['USER_ID']}"`;
    }
    pool.query(sql, function(err,row) {
      if(err){
        res.status(500).send(err);
        return console.error(err.message);
      }
      console.log(row);
      res.send(row);
    });
  });

/*
User Friends POST request handler
*/
app.route('/userFriends')
  .post(function(req, res, next){
    console.log('POST recieved to /userFriends');
    let sql = `SELECT * 
      FROM users
      WHERE RequesterID = ${req.body['USER_ID']}
      AND Status = 1`;
    pool.query(sql, function(err,row) {
      if(err){
        res.status(500).send(err);
        return console.error(err.message);
      }
      console.log(row);
      res.send(row);
    });
  });
var server = app.listen(3000);
console.log("Listening...");
