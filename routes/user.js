const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.js");
const { saveRedirectUrl } = require("../middleware.js");
const userControllers = require("../controllers/user");

// Sign Up page, and signup user
router
  .route("/signup")
  .get(userControllers.renderSignUp)
  .post(wrapAsync(userControllers.signUp));

// Login page, Login user
router
  .route("/login")
  .get(userControllers.renderLogin)
  .post(
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
