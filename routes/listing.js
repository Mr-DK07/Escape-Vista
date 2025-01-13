const express = require("express");
const router = express.Router();
// const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync");
const listingControllers = require("../controllers/listing");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//explore page and create page route
router.route("/").get(wrapAsync(listingControllers.explore)).post(
  isLoggedIn,
  upload.single("listing[image]"),
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
    upload.single("listing[image]"),
   
    wrapAsync(listingControllers.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingControllers.destroyListing));

//Edit listing route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.renderEditForm)
);

module.exports = router;
