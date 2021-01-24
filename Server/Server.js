const express = require("express");
const cors = require("cors");
var app = express();

const sqlite3 = require('sqlite3').verbose();
let db = {};

//Wrapped the db.open
let opendb = () => {
  db = new sqlite3.Database('users.db', (err) =>{
    if (err){
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQLite database.');
  });
}

//Wrapped the db.close
let closedb = () => {
  db.close((err) => {
    if (err) {
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
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded



/*
Request Test
*/
app.route("/")
  .post( function (req, res, next) {
  console.log("POST received on /");
  res.send('POST request to homepage');
  next();
}).get( function (req, res, next) {
  console.log("GET received on /");
  res.send('GET request to homepage');
  next();
})


/*
Credential verification POST request handler
returns user id if user has been successfully created returns 0 otherwise
*/
app.route("/user")
  .post(function(req, res, next) {
    console.log("POST recieved to /user");
    opendb();
    let credentials = req.body;
    let sql = `SELECT username, password, userid
    FROM credentials
    WHERE username = "${credentials.user}"
    AND  password = ${credentials.password}`;

    //execute query
    let r = db.all(sql, (err, row) => {
       if (err) {
         return console.error(err.message);
       }
      try{
       res.json(row[0].userid);
     } catch(err){
       res.json(0);
     }
     return row;
   });
   closedb();
 });




/*
Credential registration POST request handler
returns user id if user has been successfully created returns 0 otherwise
*/
app.route("/createUser")
  .post(function(req, res, next){
    console.log("POST recieved to /createUser");
    opendb();
    let credentials = req.body;
    let userId = hashCode(credentials.user);
    let sql = `SELECT userid
    FROM credentials
    WHERE userid = ${userId}`;
    let r = db.all(sql, (err, row) =>{
      if (err) {
        return console.error(err.message);
      }
      if(row[0] == undefined){
        let sql = `INSERT INTO credentials
        VALUES ("${credentials.user}", ${credentials.password}, ${userId})`;
        db.run(sql, (err) =>{
          if (err) {
            return console.error(err.message);
          }
        });
        res.json(userId);
      } else {
             res.json(0);
      }
      return row;
   });

   closedb();

 });




var server = app.listen(3000);
console.log("Listening...");
