const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const User = require("../models/user.js");

// Sign Up page
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// Save user details
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);
      req.flash("success", "User registerd successfully!");
      console.log(registeredUser);
      res.redirect("/listings");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  })
);

// Login page
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// Login route
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "welcome to Escape vista!");
    res.redirect("/listings");
  }
);

module.exports = router;
