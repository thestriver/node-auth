const express = require("express");
const cors = require('cors');

const bodyParser = require("body-parser");
const user = require("./routes/user"); //import user signup
//connect API to database
const InitiateMongoServer = require("./config/db");

// Initiate Mongo Server
InitiateMongoServer();

const app = express();


app.use(cors());

// PORT
const PORT = process.env.PORT || 4000;



// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Working" });
});


/**
 * Router Middleware
 * Router - /user/*
 * Method - *
 */
app.use("/user", user);


app.listen(PORT, (req, res) => {
  console.log(`Server Started at PORT ${PORT}`);
});

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
     next();
});


//mongodb+srv://node-auth:<testauth>@cluster0.ikxg2.mongodb.net/<node-auth>?retryWrites=true&w=majority


//Replace <password> with the password for the node-auth user. 
//Replace <dbname> with the name of the database that connections will use by default

//node-auth testauth


// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://node-auth:<password>@cluster0.ikxg2.mongodb.net/<dbname>?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });