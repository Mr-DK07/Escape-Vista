const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
// const Listing = require("./models/listing");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
// const { listingSchema, reviewSchema } = require("./schema.js");
const session = require("express-session");

const Review = require("./models/review");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

const sessionOptions = {
  secret: "secretsupercode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

app.get("/", (req, res) => {
  res.send("root working fine.");
});

// listings routes
app.use("/listings", listings);

// Listing review routes
app.use("/listings/:id/reviews", reviews);

// Page not found
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
