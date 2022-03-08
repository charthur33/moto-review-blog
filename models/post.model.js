const mongoose = require("mongoose");

//Schema and model
const postsSchema = {
    title: String,
    content: String,
    date: String,
    reviewer: String,
    make: String,
    model: String,
    year: String,
    thumbnailId: String,
    gridId: String,
    rating1: String,
    rating2: String,
    rating3: String,
    rating4: String,
    rating5: String,
    spec1: String,
    spec2: String,
    spec3: String,
    spec4: String,
    spec5: String,
    overallRating: String
  };
  
  module.exports = Post = mongoose.model("Post", postsSchema);