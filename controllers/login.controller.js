const db = require("../models");
const User = db.user;
const cf = require("../functions/custom-function.js");

// Check user credentials
exports.Login = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send(
        { status : false , message:"Login credentials cannot be empty!" }
      );
    return;
  }

  let username = req.body.username;
  let userpass = cf.encodeToBase64(req.body.password);

  //where username = username and password = userpass
  let condition = {"username":username,"password":userpass};

  //select users where username = username and password = userpass
  User.findOne(condition, {_id:0,id:1,role:1,fullname:1})
    .then(data => {
      if (!data) {
        res.status(404).send({
          status: false,
          message: `Username and password does not match!`,
          data: null
        });
      } 
      else{
        res.send({
          status: true, 
          message: "Login credentials verified successfully!",
          data: data
        });
      } 
    })
    .catch(err => {
      res.status(500).send({
        status: false,
        message: err.message,
        data: null
      });
    });
};



