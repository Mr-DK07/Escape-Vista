const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Listing = require("./models/listing");
const ejsMate = require("ejs-mate");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const MONGO_URL = "mongodb://127.0.0.1:27017/ESCAPE_VISTA";

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
  res.send("root working fine");
});

//Index route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find();
  res.render("./listings/index.ejs", { allListings });
});

// New route
app.get("/listings/new", (req, res) => {
  res.render("./listings/new.ejs");
});

//Create route
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
  console.log(newListing);
});

// Show route
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("./listings/show.ejs", { listing });
});

//Edit route
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("./listings/edit.ejs", { listing });
});

//Update route
app.put("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );
  res.redirect(`/listings/${listing._id}`);
});

//Delete route
app.delete("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

// app.get("/testListings", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "Resort",
//     image:
//       "https://media.istockphoto.com/id/119926339/photo/resort-swimming-pool.jpg?s=612x612&w=0&k=20&c=9QtwJC2boq3GFHaeDsKytF4-CavYKQuy1jBD2IRfYKc=",
//     description: "A beautiful resort",
//     price: 1000,
//     location: "Vista",
//     country: "USA",
//   });
//   await sampleListing.save();
//   console.log("saved");
//   res.send("saved successfully");
// });
