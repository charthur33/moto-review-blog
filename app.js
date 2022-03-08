const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const Post = require("./models/post.model");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { propertyOf } = require("lodash");
var search = require('youtube-search');

const homeStartingContent = "Welcome to SPG (Smiles Per Gallon) Moto Reviews! Please scroll down/see below for our most recent posts. We hope you enjoy reading about some pretty cool cars, don’t forget to subscribe to receive email updates for upcoming reviews and more.";
const aboutContent = "Here at SPG Moto Reviews we love taking in-depth looks at anything with wheels and a motor. As true car enthusiasts, our focus does not involve getting lost in the nitty-gritty details of infotainment features, efficiency ratings, cupholders, etc. Instead, we like to take a practical approach to capturing and reviewing the real experience of driving each machine we feature. We focus on five main categories: Driving dynamics, Comfort, Practicality, Bang for Buck, and of course, Smiles Per Gallon. Please feel free to subscribe to get email updates about more awesome car review content. If you have any requests for reviews, or have a cool car located near Seattle, WA that you would like us to review/feature on the blog, don’t hesitate to reach out on the contact page. Happy driving!";
const app = express();
const port = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/admin-routes", require("./adminRoutes/routes"));


let allPosts = [];

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
  res.render('contact');
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



// ****** RENDERING A POST WITH YOUTUBE REVIEWS ******** /

app.get("/posts/:postId", function (req, res) {
  //PostID url comes from "read more" link (see home.ejs)
  const postID = req.params.postId;

  //Find and display correct post from DB per the post ID
  Post.findById(postID, function (err, foundPost) {
    if (err) {
      console.log(err);
    } else {
      res.render('post', {
        //postID: foundPost._id,
        date: foundPost.date,
        reviewer: foundPost.reviewer,
        postTitle: foundPost.title,
        postText: foundPost.content,
        make: foundPost.make,
        model: foundPost.model,
        year: foundPost.year,
        thumbnailId: foundPost.thumbnailId,
        gridId: foundPost.gridId,
        rating1: foundPost.rating1,
        rating2: foundPost.rating2,
        rating3: foundPost.rating3,
        rating4: foundPost.rating4,
        rating5: foundPost.rating5,
        spec1: foundPost.spec1,
        spec2: foundPost.spec2,
        spec3: foundPost.spec3,
        spec4: foundPost.spec4,
        spec5: foundPost.spec5,
        overallRating: foundPost.overallRating
      });
    }

  });

});

app.get("/moreReviews/:postTitle", function (req, res) {
  const postTitle = req.params.postTitle;
  Post.findOne({title: postTitle}, function (err, foundPost) {
    if (err) {
      console.log(err);
    } else {
      let title = "More " + postTitle + " Reviews";
      let qString = postTitle + " reviews";
      var opts = {
        maxResults: 8,
        key: process.env.YT_API_KEY
      };
      var videoResults = [{}];

      search(qString, opts, function (err, results) {
        if (err) {
          console.log(err);
        } else {
          videoResults = results;
          res.render('moreReviews', {
            title: title,
            videoResults: videoResults
          });
        }
      });

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

mongoose.connect(
  process.env.ATLAS_CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err) => {
    if (err) throw err;
    console.log("MongoDB connection established");
  }
);