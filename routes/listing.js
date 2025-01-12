const express = require("express");
const router = express.Router();
// const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync");
const listingControllers = require("../controllers/listing");

//explore page and create page route
router
  .route("/")
  .get(wrapAsync(listingControllers.explore))
  .post(
    isLoggedIn,
    validateListing,
    wrapAsync(listingControllers.createListing)
  );

// New listing route
router.get("/new", isLoggedIn, listingControllers.renderNewForm);

// Show, update, delete listing route
router
  .route("/:id")
  .get(wrapAsync(listingControllers.showListing))
  .put(
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingControllers.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingControllers.destroyListing)
  );


//Edit listing route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.renderEditForm)
);

module.exports = router;
