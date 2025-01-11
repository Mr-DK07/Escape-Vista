const express = require("express");
const router = express.Router();
// const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync");
const listingControllers = require("../controllers/listing");

//Index route
router.get("/", wrapAsync(listingControllers.index));

// New listing route
router.get("/new", isLoggedIn, listingControllers.renderNewForm);

//Create listing route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(listingControllers.createListing)
);

// Show listing route
router.get("/:id", wrapAsync(listingControllers.showListing));

//Edit listing route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.renderEditForm)
);

//Update listing route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(listingControllers.updateListing)
);

//Delete listing route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.deleteListing)
);

module.exports = router;
