var express = require("express");
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
var router = express.Router();
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {  
  res.render("login", { error: req.flash("error") });
});

router.get("/register", function (req, res) {
  res.render("register");
});

router.get("/feed", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find().populate("user");
  res.render("feed", { user, posts });
});

router.get("/publish", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("publish", { user });
});

router.post(
  "/createpost",
  isLoggedIn,
  upload.single("file"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(400).send("No files were uploaded");
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.create({
      image: req.file.filename,
      postText: req.body.filecaption,
      user: user._id,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");

  res.render("profile", { user });
});

router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.post("/register", function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
  });
  userModel.register(data, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
    failureFlash: true,
  }),
  function (req, res, next) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

module.exports = router;
