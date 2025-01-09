const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review")

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    set: (v) =>
      v === " "
        ? "https://cdn.pixabay.com/photo/2015/09/07/19/12/hotel-928937_1280.jpg"
        : v,
    default:
      "https://cdn.pixabay.com/photo/2015/09/07/19/12/hotel-928937_1280.jpg",
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

listingSchema.post("findOneAndDelete", async(listing) => {
  if(listing){
    await Review.deleteMany({_id: {$in : listing.reviews}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
