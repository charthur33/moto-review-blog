const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { propertyOf } = require("lodash");


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const app = express();
const port = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let allPosts = [];


//***********MONGODB SETUP************ */
//Schema and model
const postsSchema = {
  title: String,
  content: String,
  make: String,
  model: String,
  year: String,
  trim: String,
  thumbnailId: String,
  carouselId: String,
  rating1: String,
  rating2: String,
  rating3: String,
  rating4: String,
  rating5: String,
  overallRating: String
};

const Post = mongoose.model("Post", postsSchema);



//***********ALL ROUTES*************** */
app.get("/", function (req, res) {
  //Find posts in the DB and render them on homepage

  Post.find({}, function (err, foundPosts) {
    if (err) {
      console.log(err);
    } else {
      res.render('home', {
        openingParagraph: homeStartingContent,
        allPosts: foundPosts
      });
    }
  });
});

app.get("/about", function (req, res) {
  res.render('about', { aboutContent: aboutContent });
});

app.get("/subscribe", function (req, res) {
  res.render('subscribe');
});

app.get("/contact", function (req, res) {
  res.render('contact', { contactContent: contactContent });
});

app.get("/compose", function (req, res) {
  res.render('compose');
});

app.get("/success", function (req, res) {
  res.render('success');
});

app.get("/failure", function (req, res) {
  res.render('failure');
});

app.get("/msgSuccess", function (req, res) {
  res.render('msgSuccess');
});

app.get("/msgFailure", function (req, res) {
  res.render('msgFailure');
});

app.get("/delete", function (req, res) {
  res.render('delete');
});




app.get("/posts/:postId", function (req, res) {
  //PostID url comes from "read more" link (see home.ejs)
  const postID = req.params.postId;

  //Find and display correct post from DB per the post ID
  Post.findById(postID, function (err, foundPost) {
    if (err) {
      console.log(err);
    } else {
      res.render('post', {
        postTitle: foundPost.title,
        postText: foundPost.content,
        make: foundPost.make,
        model: foundPost.model,
        year: foundPost.year,
        trim: foundPost.trim,
        thumbnailId: foundPost.thumbnailId,
        carouselId: foundPost.carouselId,
        rating1: foundPost.rating1,
        rating2: foundPost.rating2,
        rating3: foundPost.rating3,
        rating4: foundPost.rating4,
        rating5: foundPost.rating5,
        overallRating: foundPost.overallRating
        
      });
    }
  });

});

// title: String,
// content: String,
// make: String,
// model: String,
// year: String,
// trim: String,
// thumbnailId: String,
// carouselId: String,
// ratingText: String,
// overallRating: String


app.post("/compose", function (req, res) {
  let post_title = req.body.postTitle;
  let post_text = req.body.postText;
  let make = req.body.make;
  let model = req.body.model;
  let year = req.body.year;
  let trim = req.body.trim;
  let thumbnailId = req.body.thumbnailId;
  let carouselId = req.body.carouselId;
  let rating1 = req.body.rating1;
  let rating2 = req.body.rating2;
  let rating3 = req.body.rating3;
  let rating4 = req.body.rating4;
  let rating5 = req.body.rating5;
  let overallRating = req.body.overallRating;
 
  //Object that will store a complete blog post
  const newPost = new Post({
    title: post_title,
    content: post_text,
    make: make,
    model: model,
    year: year,
    trim: trim,
    thumbnailId: thumbnailId,
    carouselId: carouselId,
    rating1: rating1,
    rating2: rating2,
    rating3: rating3,
    rating4: rating4,
    rating5: rating5,
    overallRating: overallRating
  });

  //Callback prevents the page from reloading before new post is saved to the DB
  newPost.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });

});

app.post("/delete", function (req, res) {
  let post_title = req.body.postTitle;
  Post.deleteOne({title: post_title}, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});


app.post("/failure", function (req, res) {
  res.redirect("/subscribe");
});

app.post("/msgFailure", function (req, res) {
  res.redirect("/contact");
});

//***********************CONTACT ************** */

async function sendMail(name, email, message, subject, res) {
  let msgSent = false;

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use TLS
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  try {
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: subject,
      html: "<h3> From: " + name + "</h3><h3> Email: " + email + "</h3><p>" + message + "</p> "
    });
    res.redirect("/msgSuccess");
  } catch (err) {
    console.log(err);
    res.redirect("/msgFailure");
  }
}


app.post("/contact", function (req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let message = req.body.message;
  let subject = req.body.subject;
  sendMail(name, email, message, subject, res);
});


//***********************SUBSCRIBE/MAIL CHIMP ********/


app.post("/subscribe", function (req, res) {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  var data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  };

  const jsonData = JSON.stringify(data);

  const url = process.env.MC_URL;
  const options = {
    method: "POST",
    auth: process.env.MC_API_KEY
  }

  const request = https.request(url, options, function (response) {
    response.on("data", function (data) {
      if (response.statusCode == 200) {
        res.redirect("/success");
      } else {
        res.redirect("/failure");
      }
    })
  });

  request.write(jsonData);
  request.end();

});



//***********************SERVER / DB CONNECTION******** */

app.listen(port, () => console.log(`The server has started on port: ${port}`));
//Setting up mongoose to store posts
//connection to local DB on port 27017
mongoose.connect('mongodb://localhost:27017/motoBlogDB');