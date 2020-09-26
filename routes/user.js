const express = require("express");
const { check, validationResult} = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("./../middleware/auth");

const User = require("../model/User");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
    "/signup",
    [
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        const example = errors.array();
        
        if (!errors.isEmpty()) {
          console.log(`Validation Error : ${JSON.stringify(errors.array())}`)
            return res.status(400).json({
                //errors: errors.array()
                success:false,
                msg: example[0].msg
            });
        }

        const {
            email,
            password
        } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (user) {
              console.log(`User exists ${JSON.stringify(user)}`);
              return res.status(400).json({
                    msg: "User Already Exists",
                    success: false
                });
            }

            user = new User({
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
          
            await user.save()
           .then(result => {
            console.log(`successfully created user with detaisl ${JSON.stringify(result)}`)
            const payload = {
              user: {
                  id: result.id
                  // email: user.email
              }
            };

          jwt.sign(
              payload,
              "randomString", {
                  expiresIn: 10000
              },
              (err, token) => {
                  if (err) {
                    throw new Error (err);
                  }
                  return res.status(200).json({
                      token: token,
                      success: true
              });
              }
          );

          })
           .catch(err => {
            console.log(`Error createing a new user ${JSON.stringify(err)}`)
            throw new Error(err)
          })
          
        } catch (err) {
            console.log(`Error is the catch block : ${err.message}`);
            res.status(500).json({
              success: false,
              msg: `Error occured ${err.message}`
            });
        }
    }
);

/**
 * @method - POST
 * @param - /login
 * @description - User Login
 */

router.post(
    "/login",
    [
      check("email", "Please enter a valid email").isEmail(),
      check("password", "Please enter a valid password").isLength({
        min: 6
      })
    ],
    async (req, res) => {
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }
  
      const { email, password } = req.body;
      try {
        let user = await User.findOne({
          email
        });
        if (!user)
          return res.status(400).json({
            message: "User Not Exist"
          });
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(400).json({
            message: "Incorrect Password !"
          });
  
        const payload = {
          user: {
            id: user.id
          }
        };
  
        jwt.sign(
          payload,
          "randomString",
          {
            expiresIn: 3600
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token
            });
          }
        );
      } catch (e) {
        console.error(e);
        res.status(500).json({
          message: "Server Error"
        });
      }
    }
  );

  /**
 * @method - GET
 * @description - Get LoggedIn User
 * @param - /user/me
 */


router.get("/me", auth, async (req, res) => {
    try {
      // request.user is getting fetched from Middleware after token authentication
      const user = await User.findById(req.user.id);
      res.json(user);
    } catch (e) {
      res.send({ message: "Error in Fetching user" });
    }
  });
  

module.exports = router;
