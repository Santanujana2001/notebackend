const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var fetchuser =require("../middleware/fetchuser");

const jwt_secure = "santanu";
// ROUTE 1: creating user using post /api/auth/createuser endpoint no login required

router.post(
  "/createuser",
  [
    body("name","enter vaild name").isLength({ min: 3 }),
    body("email","enter vaild email").isEmail(),
    body("password","password must be 3 characters").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(404).json({ success, error: "email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secpass,
      });
      // .then((user) => res.json(user))
      // .catch(err=>{console.log(err)
      //   res.json({error:"enter valid credentials"})
      // })
      // res.json(user);
      const data = {
        user: {
          id: user.id,
        }
      }
      const authtoken = jwt.sign(data, jwt_secure);
      success=true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(404).send("Error occured");
    }
  }
);

//ROUTE 2 : authenticate user using post /api/auth/login endpoint no login required

router.post("/login", [
  body("email","enter vaild email").isEmail(),
  body("password","password can't be blank").exists()
], async (req, res) => {
  let success = false;
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const{email,password}=req.body;
  try {
    let user = await User.findOne({email});
    if(!user){
      success = false;
      return res.status(404).json({error:"Invalid credentials"});
    }
    const passcompare = await bcrypt.compare(password,user.password);
    if(!passcompare){
      success = false;
      return res.status(404).json({ success, error:"Invalid credentials"});
    }
    const data = {
      user: {
        id: user.id,
      }
    }
    const authtoken = jwt.sign(data, jwt_secure);
    success = true;
    res.json({ success, authtoken })
  } catch (error) {
    console.error(error.message);
    res.status(404).send("Error occured");
  }
});
//ROUTE 3 : get user details using post /api/auth/getuser endpoint login required
router.post("/getuser", fetchuser , async (req, res) => {
  try {
    userId=req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(404).send("Error occured");
  }
})

module.exports = router;
