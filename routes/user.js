const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.js");
const { saveRedirectUrl } = require("../middleware.js");
const userControllers = require("../controllers/user");

// Sign Up page
router.get("/signup", userControllers.renderSignUp);

// Save user details
router.post("/signup", wrapAsync(userControllers.signUp));

// Login page
router.get("/login", userControllers.renderLogin);

// Login route
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userControllers.login
);

// Logout route
router.get("/logout", userControllers.logout);

module.exports = router;
