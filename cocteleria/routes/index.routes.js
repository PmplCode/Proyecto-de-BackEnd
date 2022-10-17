const express = require('express');
const router = express.Router();

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/principal", (req, res, next) => {
  res.render("principal");
});
router.get("/profile", (req, res, next) => {
  res.render("profile");
});

router.get("/crear", (req, res, next) => {
  res.render("crear")
})

module.exports = router;