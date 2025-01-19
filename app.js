if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const { isLoggedIn } = require("./middleware.js");
const session = require("express-session"); // for creating session
const MongoStore = require("connect-mongo");
const flash = require("connect-flash"); // for flash messages
const passport = require("passport"); // for authentication
const LocalStrategy = require("passport-local"); // for use authentication strategies

// const Listing = require("./models/listing");
// const wrapAsync = require("./utils/wrapAsync");
// const { listingSchema, reviewSchema } = require("./schema.js");

const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const dbUrl = process.env.ATLASDB_URL;
// const MONGO_URL = "mongodb://127.0.0.1:27017/ESCAPE_VISTA";
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// Mongo session

const store = MongoStore.create({
	mongoUrl: dbUrl,
	crypto: {
		secret: process.env.SECRET,
	},
	touchAfter: 24 * 3600,
});

store.on("error", () => {
	console.log("ERROR in MONGO SESSION STORE", err);
});

// local session
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//index route
// app.get("/", (req, res) => {
//   res.render("index.ejs");
// });

function escapeRegExp(string) {
  return string.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');
}

app.get("/listings/search", async (req, res) => {
  const { query } = req.query; // Get the search query from the URL parameter

  try {
    let filter = {};
    if (query) {
      const sanitizedQuery = escapeRegExp(query); // Sanitize the query string
      filter.title = { $regex: sanitizedQuery, $options: "i" }; // Case-insensitive search
    }

    const listings = await Listing.find(filter);

    res.render("listings/search.ejs", { listings, query });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/");
  }
});


// listings routes
app.use("/listings", listingRouter);

// Listing review routes
app.use("/listings/:id/reviews", reviewRouter);

// User routes
app.use("/", userRouter);


//Search
app.get("/listings/search",);

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
