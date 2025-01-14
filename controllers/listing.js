const Listing = require("../models/listing");
const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.explore = async (req, res) => {
  const categories = [
    "Trending",
    "Iconic City",
    "Mountain",
    "Castle",
    "Pool",
    "Camping",
    "Farm",
    "Arctic",
    "Spa",
    "Adventure",
    "Dining",
    "Meeting",
  ];
  const allListings = await Listing.find();
  res.render("./listings/explore.ejs", { allListings, categories });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);

  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_150,w_250");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "listing deleted!");
  res.redirect("/listings");
};

module.exports.filterListing = async (req, res) => {
  const { category } = req.params; // Get the category from the URL
  const listings = await Listing.find({ category: category });
  if (listings.length === 0) {
    req.flash(
      "error",
      `No locations currently available in ${category}. Be the first to add a new location in this category!`
    );
    return res.redirect("/listings/new");
  }
  res.render("listings/category", { category, listings });
};

module.exports.searchListing = async (req, res) => {
  const { query } = req.query; // Get the search query from the URL parameter
  let filter = {};

  if (query) {
    filter.title = { $regex: query, $options: "i" }; // Case-insensitive search
  }
  const listing = await Listing.find(filter);
  res.render("listings/search.ejs", { listing, query });
  req.flash("error", "Something went wrong. Please try again.");
};
